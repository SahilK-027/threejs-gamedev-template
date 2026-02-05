/**
 * Audio categories supported by the AudioManager
 */
const AUDIO_CATEGORIES = {
  BGM: 'bgm',
  AMBIENT: 'ambient',
  NARRATION: 'narration',
  SFX: 'sfx',
};

/**
 * Default volume settings for each audio category
 */
const DEFAULT_VOLUMES = {
  master: 1.0,
  [AUDIO_CATEGORIES.BGM]: 0.5,
  [AUDIO_CATEGORIES.AMBIENT]: 0.6,
  [AUDIO_CATEGORIES.NARRATION]: 0.8,
  [AUDIO_CATEGORIES.SFX]: 1.0,
};

/**
 * AudioManager - Handles all audio playback in the game
 * Supports multiple audio categories: BGM, Narration, and SFX
 */
export default class AudioManager {
  constructor(resources) {
    this.resources = resources;
    this.audioContext = null;
    this.isMuted = false;

    // Volume controls per category
    this.volumes = { ...DEFAULT_VOLUMES };

    // Active audio tracks organized by category
    this.activeTracks = {
      [AUDIO_CATEGORIES.BGM]: null,
      [AUDIO_CATEGORIES.AMBIENT]: new Map(), // Multiple ambient sounds can play
      [AUDIO_CATEGORIES.NARRATION]: null,
      [AUDIO_CATEGORIES.SFX]: new Map(), // Multiple SFX can play simultaneously
    };

    // Pause state tracking
    this.pauseState = {
      [AUDIO_CATEGORIES.BGM]: this._createPauseState(),
      [AUDIO_CATEGORIES.AMBIENT]: new Map(), // Track pause state for each ambient sound
      [AUDIO_CATEGORIES.NARRATION]: this._createPauseState(),
      [AUDIO_CATEGORIES.SFX]: new Map(), // Track pause state for each SFX
    };

    this.init();
  }

  /**
   * Creates a pause state object for tracking playback position
   */
  _createPauseState() {
    return {
      isPaused: false,
      startTime: 0,
      pauseTime: 0,
      savedId: null,
      savedLoop: false,
    };
  }

  /**
   * Initialize the audio context and set up browser interaction handlers
   */
  init() {
    // Get audio context from resources or create new one
    if (this.resources.audioContext) {
      this.audioContext = this.resources.audioContext;
    } else if (
      typeof window !== 'undefined' &&
      (window.AudioContext || window.webkitAudioContext)
    ) {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    // Resume audio context on user interaction (required by browsers)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this._setupUserInteractionHandlers();
    }
  }

  /**
   * Set up event listeners to resume audio context on user interaction
   */
  _setupUserInteractionHandlers() {
    const resumeAudio = () => {
      this.audioContext.resume();
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
  }

  /**
   * Start the default background music (call after user interaction)
   */
  startBGM() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.play('bgmBrattEveretAlmond', AUDIO_CATEGORIES.BGM, {
          loop: true,
          fadeIn: 2.0,
        });
      });
    } else {
      this.play('bgmBrattEveretAlmond', AUDIO_CATEGORIES.BGM, {
        loop: true,
        fadeIn: 2.0,
      });
    }
  }

  /**
   * Core method to play audio of any category
   * @param {string} id - Asset ID from resources
   * @param {string} category - Audio category (bgm, narration, sfx)
   * @param {Object} options - Playback options
   * @param {boolean} options.loop - Whether to loop the audio
   * @param {number} options.fadeIn - Fade in duration in seconds
   * @param {number} options.volume - Volume multiplier (0-1)
   * @param {number} options.offset - Start offset in seconds
   * @returns {Object|null} Track object with source, gainNode, and sfxId (for SFX)
   */
  play(id, category = AUDIO_CATEGORIES.SFX, options = {}) {
    if (!this.audioContext || this.isMuted) return null;

    const audioBuffer = this.resources.items[id];
    if (!audioBuffer) {
      console.warn(`Audio asset "${id}" not found`);
      return null;
    }

    const {
      loop = false,
      fadeIn = 0,
      volume = 1.0,
      offset = 0,
    } = options;

    // Handle different categories
    switch (category) {
      case AUDIO_CATEGORIES.BGM:
        return this._playBGM(id, audioBuffer, { loop, fadeIn, volume, offset });
      case AUDIO_CATEGORIES.AMBIENT:
        return this._playAmbient(id, audioBuffer, { loop, fadeIn, volume, offset });
      case AUDIO_CATEGORIES.NARRATION:
        return this._playNarration(id, audioBuffer, { loop, fadeIn, volume, offset });
      case AUDIO_CATEGORIES.SFX:
        return this._playSFX(id, audioBuffer, { volume, loop });
      default:
        console.warn(`Unknown audio category: ${category}`);
        return null;
    }
  }

  /**
   * Internal method to play background music
   */
  _playBGM(id, audioBuffer, { loop, fadeIn, volume, offset }) {
    // Stop current BGM if playing
    if (this.activeTracks.bgm) {
      this._stopTrack(this.activeTracks.bgm);
    }

    const track = this._createAudioTrack(audioBuffer, {
      loop,
      fadeIn,
      volume: volume * this.volumes.bgm * this.volumes.master,
      offset,
    });

    this.activeTracks.bgm = { ...track, id, loop };
    
    const state = this.pauseState.bgm;
    state.savedId = id;
    state.savedLoop = loop;
    state.startTime = this.audioContext.currentTime - offset;
    state.isPaused = false;

    return this.activeTracks.bgm;
  }

  /**
   * Internal method to play ambient sounds
   */
  _playAmbient(id, audioBuffer, { loop, fadeIn, volume, offset }) {
    const finalVolume = volume * this.volumes.ambient * this.volumes.master;
    
    const track = this._createAudioTrack(audioBuffer, {
      loop,
      fadeIn,
      volume: finalVolume,
      offset,
    });

    // Generate unique ID for this ambient sound instance
    const ambientId = `${id}_${Date.now()}_${Math.random()}`;
    this.activeTracks.ambient.set(ambientId, { ...track, id, loop });

    // Initialize pause state for this ambient sound
    const pauseState = this._createPauseState();
    pauseState.savedId = id;
    pauseState.savedLoop = loop;
    pauseState.savedVolume = finalVolume;
    pauseState.startTime = this.audioContext.currentTime - offset;
    this.pauseState.ambient.set(ambientId, pauseState);

    // Auto cleanup when finished (if not looping)
    if (!loop) {
      track.source.onended = () => {
        this._stopTrack(track);
        this.activeTracks.ambient.delete(ambientId);
        this.pauseState.ambient.delete(ambientId);
      };
    }

    // Return both track and ambientId so caller can pause/resume specific ambient sounds
    return { ...track, ambientId };
  }
  _playNarration(id, audioBuffer, { loop, fadeIn, volume, offset }) {
    // Stop current narration if playing
    if (this.activeTracks.narration) {
      this._stopTrack(this.activeTracks.narration);
    }

    const track = this._createAudioTrack(audioBuffer, {
      loop,
      fadeIn,
      volume: volume * this.volumes.narration * this.volumes.master,
      offset,
    });

    this.activeTracks.narration = { ...track, id, loop };
    
    const state = this.pauseState.narration;
    state.savedId = id;
    state.savedLoop = loop;
    state.startTime = this.audioContext.currentTime - offset;
    state.isPaused = false;

    return this.activeTracks.narration;
  }

  /**
   * Internal method to play sound effects
   */
  _playSFX(id, audioBuffer, { volume, loop = false }) {
    const finalVolume = volume * this.volumes.sfx * this.volumes.master;
    
    const track = this._createAudioTrack(audioBuffer, {
      loop,
      fadeIn: 0,
      volume: finalVolume,
      offset: 0,
    });

    // Generate unique ID for this SFX instance
    const sfxId = `${id}_${Date.now()}_${Math.random()}`;
    this.activeTracks.sfx.set(sfxId, { ...track, id, loop });

    // Initialize pause state for this SFX
    const pauseState = this._createPauseState();
    pauseState.savedId = id;
    pauseState.savedLoop = loop;
    pauseState.savedVolume = finalVolume;
    pauseState.startTime = this.audioContext.currentTime;
    this.pauseState.sfx.set(sfxId, pauseState);

    // Auto cleanup when finished (if not looping)
    if (!loop) {
      track.source.onended = () => {
        this._stopTrack(track);
        this.activeTracks.sfx.delete(sfxId);
        this.pauseState.sfx.delete(sfxId);
      };
    }

    // Return both track and sfxId so caller can pause/resume specific SFX
    return { ...track, sfxId };
  }

  /**
   * Creates an audio track with source and gain nodes
   */
  _createAudioTrack(audioBuffer, { loop, fadeIn, volume, offset }) {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = audioBuffer;
    source.loop = loop;

    // Apply fade in if specified
    if (fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + fadeIn,
      );
    } else {
      gainNode.gain.value = volume;
    }

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0, offset);

    return { source, gainNode };
  }

  /**
   * Stops an audio track and disconnects nodes
   */
  _stopTrack(track, fadeOut = 0) {
    if (!track) return;

    const { source, gainNode } = track;
    const currentTime = this.audioContext.currentTime;

    if (fadeOut > 0) {
      gainNode.gain.cancelScheduledValues(currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOut);

      setTimeout(() => {
        try {
          source.stop();
          source.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Already stopped
        }
      }, fadeOut * 1000);
    } else {
      try {
        source.stop();
        source.disconnect();
        gainNode.disconnect();
      } catch (e) {
        // Already stopped
      }
    }
  }

  /**
   * Stop audio by category
   * @param {string} category - Audio category to stop
   * @param {number} fadeOut - Fade out duration in seconds
   * @param {string} trackId - Optional: specific track ID to stop (for AMBIENT/SFX)
   */
  stop(category, fadeOut = 1.0, trackId = null) {
    switch (category) {
      case AUDIO_CATEGORIES.BGM:
        if (this.activeTracks.bgm) {
          this._stopTrack(this.activeTracks.bgm, fadeOut);
          this.activeTracks.bgm = null;
          this.pauseState.bgm.isPaused = false;
          this.pauseState.bgm.savedId = null;
        }
        break;
      case AUDIO_CATEGORIES.AMBIENT:
        if (trackId) {
          // Stop specific ambient sound
          const track = this.activeTracks.ambient.get(trackId);
          if (track) {
            this._stopTrack(track, fadeOut);
            this.activeTracks.ambient.delete(trackId);
            this.pauseState.ambient.delete(trackId);
          }
        } else {
          // Stop all ambient sounds
          this.activeTracks.ambient.forEach((track) => {
            this._stopTrack(track, fadeOut);
          });
          this.activeTracks.ambient.clear();
          this.pauseState.ambient.clear();
        }
        break;
      case AUDIO_CATEGORIES.NARRATION:
        if (this.activeTracks.narration) {
          this._stopTrack(this.activeTracks.narration, fadeOut);
          this.activeTracks.narration = null;
          this.pauseState.narration.isPaused = false;
          this.pauseState.narration.savedId = null;
        }
        break;
      case AUDIO_CATEGORIES.SFX:
        if (trackId) {
          // Stop specific SFX
          const track = this.activeTracks.sfx.get(trackId);
          if (track) {
            this._stopTrack(track, 0);
            this.activeTracks.sfx.delete(trackId);
            this.pauseState.sfx.delete(trackId);
          }
        } else {
          // Stop all SFX
          this.activeTracks.sfx.forEach((track) => {
            this._stopTrack(track, 0);
          });
          this.activeTracks.sfx.clear();
          this.pauseState.sfx.clear();
        }
        break;
      default:
        console.warn(`Unknown audio category: ${category}`);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  stopBGM(fadeOutDuration = 1.0) {
    this.stop(AUDIO_CATEGORIES.BGM, fadeOutDuration);
  }

  /**
   * Legacy method for backward compatibility
   */
  playBGM(id, loop = true, fadeInDuration = 1.0, offset = 0) {
    return this.play(id, AUDIO_CATEGORIES.BGM, {
      loop,
      fadeIn: fadeInDuration,
      offset,
    });
  }

  /**
   * Legacy method for backward compatibility
   */
  playSFX(id, volume = 1.0) {
    return this.play(id, AUDIO_CATEGORIES.SFX, { volume });
  }

  /**
   * Pause audio by category
   * @param {string} category - Audio category to pause
   * @param {string} trackId - Optional: specific track ID to pause (for AMBIENT/SFX)
   */
  pause(category, trackId = null) {
    if (category === AUDIO_CATEGORIES.AMBIENT) {
      this._pauseAmbient(trackId);
      return;
    }
    
    if (category === AUDIO_CATEGORIES.SFX) {
      this._pauseSFX(trackId);
      return;
    }

    const state = this.pauseState[category];
    const track = this.activeTracks[category];

    if (!track || state.isPaused) return;

    // Calculate current playback position
    state.pauseTime = this.audioContext.currentTime - state.startTime;

    // Stop the current source
    this._stopTrack(track, 0);

    // Mark as paused
    state.isPaused = true;
  }

  /**
   * Resume audio by category
   * @param {string} category - Audio category to resume
   * @param {string} trackId - Optional: specific track ID to resume (for AMBIENT/SFX)
   */
  resume(category, trackId = null) {
    if (category === AUDIO_CATEGORIES.AMBIENT) {
      this._resumeAmbient(trackId);
      return;
    }
    
    if (category === AUDIO_CATEGORIES.SFX) {
      this._resumeSFX(trackId);
      return;
    }

    const state = this.pauseState[category];

    if (!state.isPaused || !state.savedId) return;

    const audioBuffer = this.resources.items[state.savedId];
    if (!audioBuffer) return;

    // Calculate offset, handling loop
    let offset = state.pauseTime;
    if (state.savedLoop && audioBuffer.duration > 0) {
      offset = offset % audioBuffer.duration;
    }

    // Restart from saved position with quick fade in
    this.play(state.savedId, category, {
      loop: state.savedLoop,
      fadeIn: 0.3,
      offset,
    });
  }

  /**
   * Pause specific ambient sound or all ambient sounds
   * @param {string} ambientId - Optional: specific ambient ID to pause, or null to pause all
   */
  _pauseAmbient(ambientId = null) {
    if (ambientId) {
      // Pause specific ambient sound
      const track = this.activeTracks.ambient.get(ambientId);
      if (!track) return;

      const pauseState = this.pauseState.ambient.get(ambientId);
      if (pauseState?.isPaused) return;

      // Calculate current playback position
      const state = pauseState || this._createPauseState();
      state.pauseTime = this.audioContext.currentTime - state.startTime;
      state.isPaused = true;

      // Suspend the audio source
      track.source.disconnect();
      track.gainNode.disconnect();

      this.pauseState.ambient.set(ambientId, state);
    } else {
      // Pause all ambient sounds
      this.activeTracks.ambient.forEach((track, id) => {
        this._pauseAmbient(id);
      });
    }
  }

  /**
   * Resume specific ambient sound or all ambient sounds
   * @param {string} ambientId - Optional: specific ambient ID to resume, or null to resume all
   */
  _resumeAmbient(ambientId = null) {
    if (ambientId) {
      // Resume specific ambient sound
      const state = this.pauseState.ambient.get(ambientId);
      if (!state?.isPaused || !state.savedId) return;

      const audioBuffer = this.resources.items[state.savedId];
      if (!audioBuffer) return;

      // Calculate offset, handling loop
      let offset = state.pauseTime;
      if (state.savedLoop && audioBuffer.duration > 0) {
        offset = offset % audioBuffer.duration;
      }

      // Restart from saved position
      const track = this._createAudioTrack(audioBuffer, {
        loop: state.savedLoop,
        fadeIn: 0.1,
        volume: state.savedVolume || this.volumes.ambient * this.volumes.master,
        offset,
      });

      // Update tracking
      this.activeTracks.ambient.set(ambientId, { ...track, id: state.savedId });
      state.startTime = this.audioContext.currentTime - offset;
      state.isPaused = false;

      // Auto cleanup when finished (if not looping)
      if (!state.savedLoop) {
        track.source.onended = () => {
          this._stopTrack(track);
          this.activeTracks.ambient.delete(ambientId);
          this.pauseState.ambient.delete(ambientId);
        };
      }
    } else {
      // Resume all paused ambient sounds
      this.pauseState.ambient.forEach((state, id) => {
        if (state.isPaused) {
          this._resumeAmbient(id);
        }
      });
    }
  }

  /**
   * Pause specific SFX or all SFX
   * @param {string} sfxId - Optional: specific SFX ID to pause, or null to pause all
   */
  _pauseSFX(sfxId = null) {
    if (sfxId) {
      // Pause specific SFX
      const track = this.activeTracks.sfx.get(sfxId);
      if (!track) return;

      const pauseState = this.pauseState.sfx.get(sfxId);
      if (pauseState?.isPaused) return;

      // Calculate current playback position
      const state = pauseState || this._createPauseState();
      state.pauseTime = this.audioContext.currentTime - state.startTime;
      state.isPaused = true;

      // Suspend the audio source
      track.source.disconnect();
      track.gainNode.disconnect();

      this.pauseState.sfx.set(sfxId, state);
    } else {
      // Pause all SFX
      this.activeTracks.sfx.forEach((track, id) => {
        this._pauseSFX(id);
      });
    }
  }

  /**
   * Resume specific SFX or all SFX
   * @param {string} sfxId - Optional: specific SFX ID to resume, or null to resume all
   */
  _resumeSFX(sfxId = null) {
    if (sfxId) {
      // Resume specific SFX
      const state = this.pauseState.sfx.get(sfxId);
      if (!state?.isPaused || !state.savedId) return;

      const audioBuffer = this.resources.items[state.savedId];
      if (!audioBuffer) return;

      // Calculate offset, handling loop
      let offset = state.pauseTime;
      if (state.savedLoop && audioBuffer.duration > 0) {
        offset = offset % audioBuffer.duration;
      }

      // Restart from saved position
      const track = this._createAudioTrack(audioBuffer, {
        loop: state.savedLoop,
        fadeIn: 0.1,
        volume: state.savedVolume || this.volumes.sfx * this.volumes.master,
        offset,
      });

      // Update tracking
      this.activeTracks.sfx.set(sfxId, { ...track, id: state.savedId });
      state.startTime = this.audioContext.currentTime - offset;
      state.isPaused = false;

      // Auto cleanup when finished (if not looping)
      if (!state.savedLoop) {
        track.source.onended = () => {
          this._stopTrack(track);
          this.activeTracks.sfx.delete(sfxId);
          this.pauseState.sfx.delete(sfxId);
        };
      }
    } else {
      // Resume all paused SFX
      this.pauseState.sfx.forEach((state, id) => {
        if (state.isPaused) {
          this._resumeSFX(id);
        }
      });
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  pauseBGM() {
    this.pause(AUDIO_CATEGORIES.BGM);
  }

  /**
   * Legacy method for backward compatibility
   */
  resumeBGM() {
    this.resume(AUDIO_CATEGORIES.BGM);
  }

  /**
   * Set volume for a specific category or master volume
   * @param {string} category - 'master', 'bgm', 'narration', or 'sfx'
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(category, volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (category === 'master') {
      this.volumes.master = clampedVolume;
      // Update all active tracks
      this._updateActiveVolumes();
    } else if (this.volumes.hasOwnProperty(category)) {
      this.volumes[category] = clampedVolume;
      // Update specific category
      this._updateCategoryVolume(category);
    } else {
      console.warn(`Unknown volume category: ${category}`);
    }
  }

  /**
   * Get current volume for a category
   * @param {string} category - 'master', 'bgm', 'narration', or 'sfx'
   */
  getVolume(category) {
    return this.volumes[category] ?? 0;
  }

  /**
   * Update volumes for all active tracks
   */
  _updateActiveVolumes() {
    this._updateCategoryVolume(AUDIO_CATEGORIES.BGM);
    this._updateCategoryVolume(AUDIO_CATEGORIES.AMBIENT);
    this._updateCategoryVolume(AUDIO_CATEGORIES.NARRATION);
    this._updateCategoryVolume(AUDIO_CATEGORIES.SFX);
  }

  /**
   * Update volume for a specific category
   */
  _updateCategoryVolume(category) {
    if (category === AUDIO_CATEGORIES.AMBIENT) {
      // Update all ambient tracks
      const categoryVolume = this.volumes.ambient;
      const masterVolume = this.volumes.master;
      this.activeTracks.ambient.forEach((track, id) => {
        const state = this.pauseState.ambient.get(id);
        if (track && !state?.isPaused) {
          track.gainNode.gain.value = categoryVolume * masterVolume;
        }
      });
      return;
    }

    if (category === AUDIO_CATEGORIES.SFX) {
      // Update all SFX tracks
      const categoryVolume = this.volumes.sfx;
      const masterVolume = this.volumes.master;
      this.activeTracks.sfx.forEach((track, id) => {
        const state = this.pauseState.sfx.get(id);
        if (track && !state?.isPaused) {
          track.gainNode.gain.value = categoryVolume * masterVolume;
        }
      });
      return;
    }

    // Handle single-track categories (BGM, NARRATION)
    const track = this.activeTracks[category];
    const state = this.pauseState[category];
    
    if (track && !state?.isPaused) {
      const categoryVolume = this.volumes[category];
      const masterVolume = this.volumes.master;
      track.gainNode.gain.value = categoryVolume * masterVolume;
    }
  }

  /**
   * Legacy methods for backward compatibility
   */
  setMasterVolume(volume) {
    this.setVolume('master', volume);
  }

  setBGMVolume(volume) {
    this.setVolume(AUDIO_CATEGORIES.BGM, volume);
  }

  setSFXVolume(volume) {
    this.setVolume(AUDIO_CATEGORIES.SFX, volume);
  }

  setAmbientVolume(volume) {
    this.setVolume(AUDIO_CATEGORIES.AMBIENT, volume);
  }

  /**
   * Toggle mute for all audio
   */
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      // Pause all active audio
      if (this.activeTracks.bgm && !this.pauseState.bgm.isPaused) {
        this.pause(AUDIO_CATEGORIES.BGM);
      }
      if (this.activeTracks.narration && !this.pauseState.narration.isPaused) {
        this.pause(AUDIO_CATEGORIES.NARRATION);
      }
      // Pause all ambient sounds
      this.pause(AUDIO_CATEGORIES.AMBIENT);
      // Pause all SFX
      this.pause(AUDIO_CATEGORIES.SFX);
    } else {
      // Resume paused audio
      if (this.pauseState.bgm.isPaused && this.pauseState.bgm.savedId) {
        this.resume(AUDIO_CATEGORIES.BGM);
      }
      if (this.pauseState.narration.isPaused && this.pauseState.narration.savedId) {
        this.resume(AUDIO_CATEGORIES.NARRATION);
      }
      // Resume all paused ambient sounds
      this.resume(AUDIO_CATEGORIES.AMBIENT);
      // Resume all paused SFX
      this.resume(AUDIO_CATEGORIES.SFX);
    }

    return this.isMuted;
  }

  /**
   * Check if audio is currently muted
   */
  isMutedState() {
    return this.isMuted;
  }

  /**
   * Check if a specific category is currently playing
   * @param {string} category - Audio category to check
   */
  isPlaying(category) {
    if (category === AUDIO_CATEGORIES.AMBIENT) {
      return this.activeTracks.ambient.size > 0;
    }
    
    if (category === AUDIO_CATEGORIES.SFX) {
      return this.activeTracks.sfx.size > 0;
    }
    
    const track = this.activeTracks[category];
    const state = this.pauseState[category];
    return track !== null && !state?.isPaused;
  }

  /**
   * Clean up all audio resources
   */
  destroy() {
    // Stop all audio
    this.stop(AUDIO_CATEGORIES.BGM, 0);
    this.stop(AUDIO_CATEGORIES.AMBIENT, 0);
    this.stop(AUDIO_CATEGORIES.NARRATION, 0);
    this.stop(AUDIO_CATEGORIES.SFX, 0);

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export audio categories for external use
export { AUDIO_CATEGORIES };
import { AUDIO_CATEGORIES } from '../Managers/AudioManager.class.js';

export default class AudioSettingsUI {
  constructor(audioManager) {
    this.audioManager = audioManager;
    
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsPanel = document.getElementById('settings-panel');
    this.closeBtn = document.getElementById('close-settings');
    this.audioToggle = document.getElementById('audio-toggle');
    
    // Volume sliders
    this.masterVolumeSlider = document.getElementById('master-volume');
    this.bgmVolumeSlider = document.getElementById('bgm-volume');
    this.ambientVolumeSlider = document.getElementById('ambient-volume');
    this.sfxVolumeSlider = document.getElementById('sfx-volume');
    
    // Volume value displays
    this.masterVolumeValue = document.getElementById('master-volume-value');
    this.bgmVolumeValue = document.getElementById('bgm-volume-value');
    this.ambientVolumeValue = document.getElementById('ambient-volume-value');
    this.sfxVolumeValue = document.getElementById('sfx-volume-value');

    this.init();
  }

  init() {
    // Toggle settings panel
    this.settingsBtn.addEventListener('click', () => {
      this.togglePanel();
    });

    this.closeBtn.addEventListener('click', () => {
      this.hidePanel();
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.settingsPanel.contains(e.target) && 
          !this.settingsBtn.contains(e.target) &&
          !this.settingsPanel.classList.contains('hidden')) {
        this.hidePanel();
      }
    });

    // Audio toggle
    this.audioToggle.addEventListener('change', (e) => {
      const isMuted = this.audioManager.toggleMute();
      this.audioToggle.checked = !isMuted;
    });

    // Master volume control
    this.masterVolumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      this.audioManager.setVolume('master', volume);
      this.masterVolumeValue.textContent = `${e.target.value}%`;
    });

    // BGM volume control
    this.bgmVolumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      this.audioManager.setVolume(AUDIO_CATEGORIES.BGM, volume);
      this.bgmVolumeValue.textContent = `${e.target.value}%`;
    });

    // Ambient volume control
    this.ambientVolumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      this.audioManager.setVolume(AUDIO_CATEGORIES.AMBIENT, volume);
      this.ambientVolumeValue.textContent = `${e.target.value}%`;
    });

    // SFX volume control
    this.sfxVolumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      this.audioManager.setVolume(AUDIO_CATEGORIES.SFX, volume);
      this.sfxVolumeValue.textContent = `${e.target.value}%`;
    });

    // Initialize values from audio manager
    this.syncUIWithAudioManager();
  }

  syncUIWithAudioManager() {
    // Master volume
    const masterVolume = Math.round(this.audioManager.getVolume('master') * 100);
    this.masterVolumeSlider.value = masterVolume;
    this.masterVolumeValue.textContent = `${masterVolume}%`;
    
    // BGM volume
    const bgmVolume = Math.round(this.audioManager.getVolume(AUDIO_CATEGORIES.BGM) * 100);
    this.bgmVolumeSlider.value = bgmVolume;
    this.bgmVolumeValue.textContent = `${bgmVolume}%`;
    
    // Ambient volume
    const ambientVolume = Math.round(this.audioManager.getVolume(AUDIO_CATEGORIES.AMBIENT) * 100);
    this.ambientVolumeSlider.value = ambientVolume;
    this.ambientVolumeValue.textContent = `${ambientVolume}%`;
    
    // SFX volume
    const sfxVolume = Math.round(this.audioManager.getVolume(AUDIO_CATEGORIES.SFX) * 100);
    this.sfxVolumeSlider.value = sfxVolume;
    this.sfxVolumeValue.textContent = `${sfxVolume}%`;
    
    // Audio toggle
    this.audioToggle.checked = !this.audioManager.isMutedState();
  }

  togglePanel() {
    this.settingsPanel.classList.toggle('hidden');
  }

  showPanel() {
    this.settingsPanel.classList.remove('hidden');
  }

  hidePanel() {
    this.settingsPanel.classList.add('hidden');
  }

  destroy() {
    // Clean up event listeners if needed
  }
}

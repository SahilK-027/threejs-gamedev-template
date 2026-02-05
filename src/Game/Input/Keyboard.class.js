import { AUDIO_CATEGORIES } from '../Managers/AudioManager.class.js';

export default class KeyboardControls {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.keys = {};
    
    this.init();
  }

  init() {
    // Track key states
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.handleKeyPress(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  handleKeyPress(key) {
    // Play laugh sound when L is pressed
    if (key === 'l') {
      this.audioManager.play('sfxNixLaugh', AUDIO_CATEGORIES.SFX, {
        volume: 1.0,
      });
    }
  }

  isKeyPressed(key) {
    return this.keys[key.toLowerCase()] || false;
  }

  destroy() {
    // Clean up event listeners if needed
  }
}

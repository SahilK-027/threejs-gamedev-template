import * as THREE from 'three';
import Sizes from './Utils/Sizes.class';
import Time from './Utils/Time.class';
import Camera from './Core/Camera.class';
import Renderer from './Core/Renderer.class';
import World from './World/World.scene';
import DebugPane from './Utils/DebugPane.class';
import AudioManager from './Managers/AudioManager.class';
import AudioSettingsUI from './UI/AudioSettingsUI.class';
import VisibilityManager from './Managers/VisibilityManager.class';
import KeyboardControls from './Input/Keyboard.class';

export default class Game {
  constructor(canvas, resources, debugMode) {
    // Singleton
    if (Game.instance) {
      return Game.instance;
    }
    Game.instance = this;

    this.isDebugEnabled = debugMode;
    if (this.isDebugEnabled) {
      this.debug = new DebugPane();
    }

    this.canvas = canvas;
    this.resources = resources;
    this.isPaused = false;

    // Visibility Manager
    this.visibilityManager = new VisibilityManager();

    // Audio
    this.audioManager = new AudioManager(this.resources);
    this.audioSettingsUI = new AudioSettingsUI(this.audioManager);

    // Input
    this.keyboard = new KeyboardControls(this.audioManager);

    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    this.time.on('animate', () => {
      this.update();
    });
    this.sizes.on('resize', () => {
      this.resize();
    });

    // Listen to visibility changes
    this.visibilityManager.on('pause', () => {
      this.pause();
    });
    this.visibilityManager.on('resume', () => {
      this.resume();
    });
  }

  static getInstance() {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    if (this.isPaused) return;

    this.camera.update();
    this.world.update();
    this.renderer.update();
  }

  pause() {
    if (this.isPaused) return;

    this.isPaused = true;

    // Pause time (stops delta time accumulation)
    if (this.time) this.time.pause();

    // Pause audio
    if (this.audioManager && !this.audioManager.isMuted) {
      this.audioManager.pauseBGM();
    }
  }

  resume() {
    if (!this.isPaused) return;

    this.isPaused = false;

    // Resume time
    if (this.time) this.time.resume();

    // Resume audio
    if (this.audioManager && !this.audioManager.isMuted) {
      // Handle audio context resume
      if (this.audioManager.audioContext?.state === 'suspended') {
        this.audioManager.audioContext.resume().then(() => {
          this.audioManager.resumeBGM();
        });
      } else {
        this.audioManager.resumeBGM();
      }
    }
  }

  destroy() {
    this.sizes.off('resize');
    this.time.off('animate');
    this.visibilityManager.off('pause');
    this.visibilityManager.off('resume');

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (typeof value?.dispose === 'function') {
            value.dispose();
          }
        }
      }
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];
        mats.forEach((m) => {
          // dispose textures
          for (const key in m) {
            const prop = m[key];
            if (prop && prop.isTexture) prop.dispose();
          }
          m.dispose();
        });
      }
    });

    this.camera.controls.dispose();
    this.renderer.rendererInstance.dispose();
    if (this.debug) this.debug.dispose();
    if (this.audioManager) this.audioManager.destroy();
    if (this.audioSettingsUI) this.audioSettingsUI.destroy();
    if (this.visibilityManager) this.visibilityManager.destroy();
    if (this.keyboard) this.keyboard.destroy();

    // Null references
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.debug = null;
    this.audioManager = null;
    this.audioSettingsUI = null;
    this.visibilityManager = null;
    this.keyboard = null;
  }
}

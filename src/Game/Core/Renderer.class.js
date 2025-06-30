import * as THREE from 'three';
import Game from '../Game.class';
import PerformanceMonitor from '../Utils/PerformanceMonitor';

export default class Renderer {
  constructor() {
    this.game = Game.getInstance();
    this.canvas = this.game.canvas;
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;
    this.camera = this.game.camera;
    this.renderer = this.game.renderer;
    this.debug = this.game.debug;

    this.setRendererInstance();
  }

  setRendererInstance() {
    const toneMappingOptions = {
      NoToneMapping: THREE.NoToneMapping,
      LinearToneMapping: THREE.LinearToneMapping,
      ReinhardToneMapping: THREE.ReinhardToneMapping,
      CineonToneMapping: THREE.CineonToneMapping,
      ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
      AgXToneMapping: THREE.AgXToneMapping,
      NeutralToneMapping: THREE.NeutralToneMapping,
    };

    this.rendererInstance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.rendererInstance.toneMapping = THREE.NeutralToneMapping;
    this.debug.add(
      this.rendererInstance,
      'toneMapping',
      {
        options: toneMappingOptions,
        label: 'Tone Mapping',
        onChange: (toneMappingType) => {
          this.rendererInstance.toneMapping = toneMappingType;
        },
      },
      'Renderer Settings'
    );

    this.rendererInstance.toneMappingExposure = 1.75;
    this.rendererInstance.shadowMap.enabled = true;
    this.rendererInstance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);
    this.rendererInstance.setPixelRatio(this.sizes.pixelRatio);

    this.setUpPerformanceMonitor();
  }

  setUpPerformanceMonitor() {
    this.perf = new PerformanceMonitor(this.rendererInstance);
  }

  resize() {
    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);
    this.rendererInstance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    this.perf.beginFrame();
    this.rendererInstance.render(this.scene, this.camera.cameraInstance);
    this.perf.endFrame();
  }
}

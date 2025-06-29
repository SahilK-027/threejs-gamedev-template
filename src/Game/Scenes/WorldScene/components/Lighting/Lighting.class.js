import * as THREE from 'three';
import Game from '../../../../Game.class';

export default class Lighting {
  constructor({ helperEnabled = false }) {
    this.game = new Game();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.helperEnabled = helperEnabled;

    this.setSunlightInstance();
    this.setEnvironmentMapInstance();
  }

  setSunlightInstance() {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 3);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3, 1, -2);
    this.scene.add(this.sunLight);

    if (this.helperEnabled) {
      this.sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight);
      this.scene.add(this.sunLightHelper);
    }
  }

  setEnvironmentMapInstance() {
    this.environmentMap = {};
    this.environmentMap.intensity = 2.0;
    this.environmentMap.texture = this.resources.items.environmentMapTexture;
    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;

    this.environmentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMap = this.environmentMap.texture;
          child.material.envMapIntensity = this.environmentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };
    this.environmentMap.updateMaterials();

    this.scene.environment = this.environmentMap.texture;
  }
}

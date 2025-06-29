import * as THREE from 'three';
import Game from '../../../../Game.class';

export default class Lion {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.time = this.game.time;

    this.modelResource = this.resources.items.lionModel;
    this.setModelInstance();
    this.setAnimation();
  }

  setModelInstance() {
    this.lion = this.modelResource.scene;
    this.lion.scale.set(0.005, 0.005, 0.005);
    this.lion.position.set(0, 0.02, 0);

    this.lion.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.scene.add(this.lion);
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.lion);
    this.animation.actions = this.animation.mixer.clipAction(
      this.modelResource.animations[0]
    );
    this.animation.actions.play();
  }

  update() {
    this.animation?.mixer.update(this.time.delta);
  }
}

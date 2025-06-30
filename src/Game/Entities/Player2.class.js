import * as THREE from 'three';
import Game from '../Game.class';
import Stage from '../Scenes/WorldScene/components/Stage/Stage.class';

export default class Player2 {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.time = this.game.time;

    this.modelResource = this.resources.items.player2Model;
    this.setModelInstance();
    this.setAnimation();
    this.setStage();
  }

  setModelInstance() {
    this.player = this.modelResource.scene;
    this.player.scale.set(18, 18, 18);
    this.player.position.set(0.3, 0.1 / 2, -0.3);
    this.player.rotation.set(0, Math.PI / 3, 0);

    this.player.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.scene.add(this.player);
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.player);
    this.animation.actions = this.animation.mixer.clipAction(
      this.modelResource.animations[29]
    );
    this.animation.actions.play();
  }

  setStage() {
    this.stage = new Stage(this.player.position);
  }

  update() {
    this.animation?.mixer.update(this.time.delta);
  }
}

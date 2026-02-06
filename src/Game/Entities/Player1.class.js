import * as THREE from 'three';
import Game from '../Game.class';
import Stage from '../World/Components/Stage/Stage.class';

export default class Player1 {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.time = this.game.time;

    this.modelResource = this.resources.items.player1Model;
    this.setModelInstance();
    this.setAnimation();
    this.setStage();
  }

  setModelInstance() {
    this.player = this.modelResource.scene;
    this.player.scale.set(0.2, 0.2, 0.2);
    this.player.position.set(-0.3, 0.1 / 2, 0.3);
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
    this.animation.animationIndices = [28, 29];
    this.animation.currentIndex = 0;
    this.animation.fadeDuration = 0.25;

    // Set up finished event listener
    this.animation.mixer.addEventListener('finished', () => {
      this.playNextAnimation();
    });

    // Play first animation
    this.playAnimation(this.animation.animationIndices[0]);
  }

  playAnimation(index) {
    const newAction = this.animation.mixer.clipAction(
      this.modelResource.animations[index],
    );
    newAction.setLoop(THREE.LoopOnce);
    newAction.clampWhenFinished = true;
    newAction.reset();

    if (this.animation.currentAction) {
      // Crossfade from current to new animation
      newAction.crossFadeFrom(
        this.animation.currentAction,
        this.animation.fadeDuration,
        true,
      );
    }

    newAction.play();
    this.animation.currentAction = newAction;
  }

  playNextAnimation() {
    this.animation.currentIndex =
      (this.animation.currentIndex + 1) %
      this.animation.animationIndices.length;
    this.playAnimation(
      this.animation.animationIndices[this.animation.currentIndex],
    );
  }

  setStage() {
    this.stage = new Stage(this.player.position);
  }

  update() {
    this.animation?.mixer.update(this.time.delta);
  }
}

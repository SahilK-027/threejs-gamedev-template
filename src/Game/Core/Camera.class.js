import * as THREE from 'three';
import Game from '../Game.class';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Camera {
  constructor(fov = 35, near = 0.1, far = 100) {
    this.game = new Game();
    this.canvas = this.game.canvas;
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;

    this.setPerspectiveCameraInstance(fov, near, far);
    this.setOrbitControls();
  }

  setPerspectiveCameraInstance(fov, near, far) {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      near,
      far
    );
    this.cameraInstance.position.set(1.75, 1.0, 1.75);
    this.scene.add(this.cameraInstance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.cameraInstance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI / 2.3;
  }

  resize() {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance.aspect = aspectRatio;
    this.cameraInstance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}

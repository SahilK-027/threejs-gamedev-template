import * as THREE from 'three';
import Game from '../../../Game.class';

export default class Floor {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;

    this.setFloorInstance();
  }

  setFloorInstance() {
    const GRID_SIZE = 100;
    this.floorGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, 1, 1);
    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: '#121316',
      roughness: 0.9,
      metalness: 0.1,
    });

    this.floorMesh = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.receiveShadow = true;

    this.scene.add(this.floorMesh);
  }
}

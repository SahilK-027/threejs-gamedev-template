import * as THREE from 'three';
import Game from '../../../../Game.class';

export default class RockyTerrain {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.resources = this.game.resources;

    this.setRockyTerrainInstance();
  }

  setRockyTerrainInstance() {
    this.rockyTerrainGeometry = this.getRockyTerrainGeometry();
    this.rockyTerrainMaterial = this.getRockyTerrainMaterial();

    this.scene.add(this.getRockyTerrainMesh());
  }

  getRockyTerrainGeometry() {
    return new THREE.PlaneGeometry(2, 2, 128, 128);
  }

  getRockyTerrainMaterial() {
    const rockyTerrainTextures = {
      diffuseMap: this.resources.items.rockyTerrainDiffuseMap,
      normalMap: this.resources.items.rockyTerrainNormalMap,
      aoMap: this.resources.items.rockyTerrainAOMap,
      displacementMap: this.resources.items.rockyTerrainDisplacementMap,
    };

    for (const map in rockyTerrainTextures) {
      rockyTerrainTextures[map].wrapS = THREE.RepeatWrapping;
      rockyTerrainTextures[map].wrapT = THREE.RepeatWrapping;
      rockyTerrainTextures[map].magFilter = THREE.NearestFilter;
      rockyTerrainTextures[map].minFilter = THREE.NearestFilter;
    }

    return new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.3,
      map: rockyTerrainTextures.diffuseMap,
      normalMap: rockyTerrainTextures.normalMap,
      aoMap: rockyTerrainTextures.aoMap,
      displacementMap: rockyTerrainTextures.displacementMap,
      displacementBias: 0.02,
      displacementScale: 0.05,
    });
  }

  getRockyTerrainMesh() {
    this.rockyTerrainMesh = new THREE.Mesh(
      this.rockyTerrainGeometry,
      this.rockyTerrainMaterial
    );
    this.rockyTerrainMesh.rotation.x = -Math.PI / 2;
    this.rockyTerrainMesh.receiveShadow = true;

    return this.rockyTerrainMesh;
  }
}

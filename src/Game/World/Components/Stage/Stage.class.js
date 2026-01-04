import * as THREE from 'three';
import Game from '../../../Game.class';

export default class Stage {
  constructor(position) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;

    this.setStageInstance(position);
  }

  setStageInstance(position) {
    this.stageGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 64, 64);
    this.stageMaterial = this.getStageMaterial();

    this.stageMesh = new THREE.Mesh(this.stageGeometry, this.stageMaterial);
    this.stageMesh.position.set(position.x, 0, position.z);
    this.stageMesh.receiveShadow = true;
    this.scene.add(this.stageMesh);
  }

  getStageMaterial() {
    const rubberTilesTextures = {
      diffuseMap: this.resources.items.rubberTilesDiffuseMap,
      normalMap: this.resources.items.rubberTilesNormalMap,
      aoMap: this.resources.items.rubberTilesAOMap,
      displacementMap: this.resources.items.rubberTilesDisplacementMap,
    };
    rubberTilesTextures.diffuseMap.colorSpace = THREE.SRGBColorSpace;

    for (const map in rubberTilesTextures) {
      rubberTilesTextures[map].wrapS = THREE.RepeatWrapping;
      rubberTilesTextures[map].wrapT = THREE.RepeatWrapping;
      rubberTilesTextures[map].magFilter = THREE.NearestFilter;
      rubberTilesTextures[map].minFilter = THREE.NearestFilter;
    }

    return new THREE.MeshStandardMaterial({
      metalness: 0.2,
      roughness: 1.0,
      color: 'grey',
      map: rubberTilesTextures.diffuseMap,
      normalMap: rubberTilesTextures.normalMap,
      aoMap: rubberTilesTextures.aoMap,
      displacementMap: rubberTilesTextures.displacementMap,
      displacementScale: 0,
    });
  }
}

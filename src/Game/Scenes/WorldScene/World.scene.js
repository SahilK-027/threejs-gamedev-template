import * as THREE from 'three';
import Game from '../../Game.class';
import DebugFloor from './components/DebugFloor/DebugFloor.class';
import Lighting from './components/Lighting/Lighting.class';
import RockyTerrain from './components/RockyTerrain/RockyTerrain.class';
import Lion from './components/Lion/Lion.class';

export default class World {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;

    /**
     * Scene objects
     */
    this.scene.fog = new THREE.FogExp2(0x121316, 0.075);
    this.rockyTerrain = new RockyTerrain();
    this.debugFloor = new DebugFloor();
    this.lion = new Lion();

    this.lighting = new Lighting({ helperEnabled: false });
  }

  update() {
    this.lion.update();
  }
}

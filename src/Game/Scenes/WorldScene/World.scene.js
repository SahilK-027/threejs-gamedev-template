import * as THREE from 'three';
import Game from '../../Game.class';
import DebugFloor from './components/DebugFloor/DebugFloor.class';
import Lighting from './components/Lighting/Lighting.class';
import Player1 from '../../Entities/Player1.class';
import Player2 from '../../Entities/Player2.class';

export default class World {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;

    /**
     * Scene objects
     */
    this.scene.fog = new THREE.FogExp2(0x121316, 0.075);
    this.debugFloor = new DebugFloor();
    this.player1 = new Player1();
    this.player2 = new Player2();

    this.lighting = new Lighting({ helperEnabled: false });
  }

  update() {
    this.player1.update();
    this.player2.update();
  }
}

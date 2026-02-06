import * as THREE from 'three';
import Game from '../Game.class';
import Floor from './Components/Floor/Floor.class';
import Lighting from './Components/Lighting/Lighting.class';
import Player1 from '../Entities/Player1.class';
import Player2 from '../Entities/Player2.class';
import GizmoHelper from '../Utils/GizmoHelper.class';

export default class World {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;

    /**
     * Scene objects
     */
    this.scene.fog = new THREE.FogExp2(0x000000, 0.125);
    this.floor = new Floor();
    this.player1 = new Player1();
    this.player2 = new Player2();

    this.lighting = new Lighting({ helperEnabled: false });

    // Setup gizmo if debug mode is enabled
    if (this.game.isDebugEnabled) {
      this.setupGizmo();
    }
  }

  setupGizmo() {
    // Create gizmo helper with custom colors and alignment
    this.gizmoHelper = new GizmoHelper({
      alignment: 'bottom-right',
      axisColors: ['#ff183b', '#96ff02', '#0066ff'],
      size: 200,
      margin: -2.5,
    });
    this.gizmoHelper.setMainCamera(this.game.camera.cameraInstance);
  }

  update() {
    this.player1.update();
    this.player2.update();

    // Update gizmo to match camera orientation
    if (this.gizmoHelper) {
      this.gizmoHelper.update();
    }
  }

  render() {
    // Render gizmo overlay if available
    if (this.gizmoHelper) {
      this.gizmoHelper.render(
        this.game.renderer.rendererInstance,
        this.game.renderer.canvas,
      );
    }
  }
}

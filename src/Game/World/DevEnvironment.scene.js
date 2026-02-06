import * as THREE from 'three';
import Game from '../Game.class';
import DebugFloor from './Components/DebugFloor/DebugFloor.class';
import Lighting from './Components/Lighting/Lighting.class';
import GizmoHelper from '../Utils/GizmoHelper.class';

/**
 * DevEnvironment - A dedicated 3D playground for testing objects
 *
 * This environment provides a clean, grid-based space for developers
 * to add and test new 3D objects before integrating them into the game.
 *
 * Usage: Add ?env=dev to the URL to load this environment
 */
export default class DevEnvironment {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.testObjects = [];

    // Setup environment
    this.setupEnvironment();
    this.setupLighting();
    this.setupTestArea();
    this.setupGizmo();
  }

  setupEnvironment() {
    // Lighter fog for better visibility in dev mode
    this.scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);

    // Add grid floor
    this.debugFloor = new DebugFloor();
  }

  setupLighting() {
    // Enhanced lighting for better object visibility
    this.lighting = new Lighting({
      helperEnabled: this.game.isDebugEnabled,
    });

    // Add additional fill light for dev environment
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  setupTestArea() {
    // Add a reference cube at origin
    const refGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const refMaterial = new THREE.MeshNormalMaterial();
    this.referenceCube = new THREE.Mesh(refGeometry, refMaterial);
    this.referenceCube.position.set(0, 0.125, 0);
    this.scene.add(this.referenceCube);

    // Add grid helper for additional reference
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
    this.scene.add(gridHelper);
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

  /**
   * Add your test objects here
   * Example:
   *
   * addTestObject(object, options = {}) {
   *   this.scene.add(object);
   *   this.testObjects.push({ mesh: object, ...options });
   * }
   */
  addTestObject(object, options = {}) {
    this.scene.add(object);
    this.testObjects.push({ mesh: object, ...options });
    return object;
  }

  /**
   * Remove a test object from the scene
   */
  removeTestObject(object) {
    const index = this.testObjects.findIndex((item) => item.mesh === object);
    if (index !== -1) {
      this.scene.remove(object);
      this.testObjects.splice(index, 1);

      // Cleanup
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  }

  /**
   * Clear all test objects
   */
  clearTestObjects() {
    this.testObjects.forEach((item) => {
      this.scene.remove(item.mesh);
      if (item.mesh.geometry) item.mesh.geometry.dispose();
      if (item.mesh.material) {
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((mat) => mat.dispose());
        } else {
          item.mesh.material.dispose();
        }
      }
    });
    this.testObjects = [];
  }

  update() {
    // Update gizmo to match camera orientation
    if (this.gizmoHelper) {
      this.gizmoHelper.update();
    }
  }

  render() {
    // Render gizmo overlay
    if (this.gizmoHelper) {
      this.gizmoHelper.render(
        this.game.renderer.rendererInstance,
        this.game.renderer.canvas,
      );
    }
  }
}

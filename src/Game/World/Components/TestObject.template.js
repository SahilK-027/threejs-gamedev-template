import * as THREE from 'three';
import Game from '../../Game.class';

/**
 * TestObject Template
 * 
 * Copy this template to create new test objects for the dev environment.
 * 
 * Usage:
 * 1. Copy this file and rename it (e.g., MyTestObject.class.js)
 * 2. Implement your object in the setup() method
 * 3. Add animation logic in update() if needed
 * 4. Import and instantiate in DevEnvironment.scene.js
 */
export default class TestObject {
  constructor(options = {}) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    
    // Configuration
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.scale = options.scale || 1;
    this.color = options.color || 0x00ff00;
    
    this.setup();
  }

  setup() {
    // Example: Create a simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: this.color,
      metalness: 0.3,
      roughness: 0.7
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.scale.setScalar(this.scale);
    
    // Add to scene
    this.scene.add(this.mesh);
    
    // Optional: Add to debug GUI
    if (this.game.debug) {
      const folder = this.game.debug.addFolder({ title: 'Test Object' });
      folder.addInput(this.mesh.position, 'x', { min: -10, max: 10 });
      folder.addInput(this.mesh.position, 'y', { min: -10, max: 10 });
      folder.addInput(this.mesh.position, 'z', { min: -10, max: 10 });
      folder.addInput(this.mesh.rotation, 'y', { min: 0, max: Math.PI * 2 });
    }
  }

  update() {
    // Add animation logic here
    // Example: Rotate the object
    if (this.mesh) {
      this.mesh.rotation.y += 0.01;
    }
  }

  destroy() {
    // Cleanup
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }
  }
}

/**
 * Example Usage in DevEnvironment.scene.js:
 * 
 * import TestObject from './Components/TestObject.class.js';
 * 
 * // In constructor or setup method:
 * this.testObject = new TestObject({
 *   position: { x: 2, y: 1, z: 0 },
 *   scale: 1.5,
 *   color: 0xff6600
 * });
 * 
 * // In update method:
 * this.testObject.update();
 */

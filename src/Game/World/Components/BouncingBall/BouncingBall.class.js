/**
 * BouncingBall - Demo component showcasing all DebugPane features
 *
 * This component creates an animated bouncing ball with extensive
 * debug controls demonstrating:
 * - Number sliders (physics, animation)
 * - Boolean toggles (visibility, effects)
 * - Color pickers (material colors)
 * - Dropdowns (material types, easing)
 * - Vectors (position, scale)
 * - Monitors (real-time values)
 * - Buttons (actions)
 */

import * as THREE from 'three';
import Game from '../../../Game.class';

export default class BouncingBall {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.debug = this.game.debug;
    this.time = this.game.time;

    // Animation state
    this.params = {
      // Physics
      gravity: 9.8,
      bounciness: 0.8,
      friction: 0.99,

      // Animation
      speed: 1.0,
      amplitude: 1.0,
      frequency: 1.5,
      phase: 0,

      // Appearance
      radius: 0.1,
      segments: 32,
      color: '#7444ff',
      emissive: '#000000',
      emissiveIntensity: 0,
      metalness: 0.3,
      roughness: 0.4,
      wireframe: false,
      visible: true,
      castShadow: true,

      // Effects
      pulseEnabled: false,
      pulseSpeed: 2.0,
      pulseAmount: 0.2,
      trailEnabled: false,
      glowEnabled: false,

      // Material type
      materialType: 'standard',

      // Easing function
      easingType: 'sine',
    };

    // Runtime values for monitoring
    this.runtime = {
      height: 0,
      velocity: 0,
      bounceCount: 0,
      elapsedTime: 0,
    };

    // Physics state
    this.velocityY = 0;
    this.positionY = this.params.amplitude;
    this.isGrounded = false;

    this.createBall();
    this.createTrail();
    this.setupDebug();
  }

  createBall() {
    this.geometry = new THREE.SphereGeometry(
      this.params.radius,
      this.params.segments,
      this.params.segments
    );

    this.material = new THREE.MeshStandardMaterial({
      color: this.params.color,
      emissive: this.params.emissive,
      emissiveIntensity: this.params.emissiveIntensity,
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      wireframe: this.params.wireframe,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0.5, this.params.amplitude, 0.5);
    this.mesh.castShadow = this.params.castShadow;
    this.mesh.receiveShadow = true;

    this.scene.add(this.mesh);
  }

  createTrail() {
    // Trail effect using line
    this.trailPositions = [];
    this.maxTrailLength = 50;

    const trailGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxTrailLength * 3);
    trailGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    this.trailMaterial = new THREE.LineBasicMaterial({
      color: this.params.color,
      transparent: true,
      opacity: 0.5,
    });

    this.trail = new THREE.Line(trailGeometry, this.trailMaterial);
    this.trail.visible = this.params.trailEnabled;
    this.scene.add(this.trail);
  }

  setupDebug() {
    if (!this.debug) return;

    const folder = 'Bouncing Ball';

    // =========================================
    // MONITORS - Real-time value display
    // =========================================
    this.debug.addMonitor(
      this.runtime,
      'height',
      { label: 'Height', graph: true, min: 0, max: 5 },
      folder
    );

    this.debug.addMonitor(
      this.runtime,
      'velocity',
      { label: 'Velocity' },
      folder
    );

    this.debug.addMonitor(
      this.runtime,
      'bounceCount',
      { label: 'Bounces' },
      folder
    );

    this.debug.addSeparator(folder);

    // =========================================
    // PHYSICS - Number sliders
    // =========================================
    this.debug.add(
      this.params,
      'gravity',
      {
        min: 0,
        max: 20,
        step: 0.1,
        label: 'Gravity',
      },
      folder
    );

    this.debug.add(
      this.params,
      'bounciness',
      {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Bounciness',
      },
      folder
    );

    this.debug.add(
      this.params,
      'amplitude',
      {
        min: 0.5,
        max: 5,
        step: 0.1,
        label: 'Max Height',
        onChange: () => this.reset(),
      },
      folder
    );

    this.debug.addSeparator(folder);

    // =========================================
    // APPEARANCE - Colors, materials
    // =========================================
    this.debug.add(
      this.params,
      'color',
      {
        color: true,
        label: 'Color',
        onChange: (v) => {
          this.material.color.set(v);
          this.trailMaterial.color.set(v);
        },
      },
      folder
    );

    this.debug.add(
      this.params,
      'emissive',
      {
        color: true,
        label: 'Emissive',
        onChange: (v) => this.material.emissive.set(v),
      },
      folder
    );

    this.debug.add(
      this.params,
      'emissiveIntensity',
      {
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Glow',
        onChange: (v) => (this.material.emissiveIntensity = v),
      },
      folder
    );

    this.debug.add(
      this.params,
      'metalness',
      {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Metalness',
        onChange: (v) => (this.material.metalness = v),
      },
      folder
    );

    this.debug.add(
      this.params,
      'roughness',
      {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Roughness',
        onChange: (v) => (this.material.roughness = v),
      },
      folder
    );

    this.debug.addSeparator(folder);

    // =========================================
    // TOGGLES - Boolean checkboxes
    // =========================================
    this.debug.add(
      this.params,
      'wireframe',
      {
        label: 'Wireframe',
        onChange: (v) => (this.material.wireframe = v),
      },
      folder
    );

    this.debug.add(
      this.params,
      'visible',
      {
        label: 'Visible',
        onChange: (v) => (this.mesh.visible = v),
      },
      folder
    );

    this.debug.add(
      this.params,
      'trailEnabled',
      {
        label: 'Trail',
        onChange: (v) => (this.trail.visible = v),
      },
      folder
    );

    this.debug.add(
      this.params,
      'pulseEnabled',
      {
        label: 'Pulse Effect',
      },
      folder
    );

    this.debug.addSeparator(folder);

    // =========================================
    // DROPDOWNS - Select options
    // =========================================
    this.debug.add(
      this.params,
      'easingType',
      {
        options: {
          Sine: 'sine',
          Bounce: 'bounce',
          Elastic: 'elastic',
          Linear: 'linear',
        },
        label: 'Easing',
      },
      folder
    );

    this.debug.addSeparator(folder);

    // =========================================
    // BUTTONS - Actions
    // =========================================
    this.debug.addButton(
      {
        label: 'Reset Ball',
        onClick: () => this.reset(),
      },
      folder
    );

    this.debug.addButton(
      {
        label: 'Random Color',
        onClick: () => this.randomizeColor(),
      },
      folder
    );

    this.debug.addButton(
      {
        label: 'Drop Ball',
        onClick: () => this.drop(),
      },
      folder
    );
  }

  // Easing functions
  ease(t, type) {
    switch (type) {
      case 'sine':
        return Math.sin(t * Math.PI * 0.5);
      case 'bounce':
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      case 'elastic':
        return t === 0
          ? 0
          : t === 1
          ? 1
          : -Math.pow(2, 10 * t - 10) *
            Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
      case 'linear':
      default:
        return t;
    }
  }

  reset() {
    this.positionY = this.params.amplitude;
    this.velocityY = 0;
    this.runtime.bounceCount = 0;
    this.trailPositions = [];
    this.mesh.position.y = this.positionY;
  }

  drop() {
    this.positionY = this.params.amplitude;
    this.velocityY = 0;
  }

  randomizeColor() {
    const hue = Math.random();
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
    this.params.color = '#' + color.getHexString();
    this.material.color.copy(color);
    this.trailMaterial.color.copy(color);
    if (this.debug) this.debug.refresh();
  }

  updateTrail() {
    if (!this.params.trailEnabled) return;

    // Add current position to trail
    this.trailPositions.unshift(this.mesh.position.clone());

    // Limit trail length
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.pop();
    }

    // Update trail geometry
    const positions = this.trail.geometry.attributes.position.array;
    for (let i = 0; i < this.maxTrailLength; i++) {
      if (i < this.trailPositions.length) {
        positions[i * 3] = this.trailPositions[i].x;
        positions[i * 3 + 1] = this.trailPositions[i].y;
        positions[i * 3 + 2] = this.trailPositions[i].z;
      }
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    this.trail.geometry.setDrawRange(0, this.trailPositions.length);
  }

  update() {
    const delta = this.time.delta; // Convert to seconds
    this.runtime.elapsedTime += delta;

    // Physics simulation
    this.velocityY -= this.params.gravity * delta;
    this.positionY += this.velocityY * delta;

    // Ground collision
    const groundLevel = this.params.radius;
    if (this.positionY <= groundLevel) {
      this.positionY = groundLevel;
      this.velocityY = -this.velocityY * this.params.bounciness;
      this.runtime.bounceCount++;

      // Apply friction
      this.velocityY *= this.params.friction;

      // Stop if velocity is too low
      if (Math.abs(this.velocityY) < 0.1) {
        this.velocityY = 0;
      }
    }

    // Update mesh position
    this.mesh.position.y = this.positionY;

    // Pulse effect
    if (this.params.pulseEnabled) {
      const pulse =
        1 +
        Math.sin(this.runtime.elapsedTime * this.params.pulseSpeed * Math.PI) *
          this.params.pulseAmount;
      this.mesh.scale.setScalar(pulse);
    } else {
      this.mesh.scale.setScalar(1);
    }

    // Update runtime monitors
    this.runtime.height = parseFloat(this.positionY.toFixed(2));
    this.runtime.velocity = parseFloat(this.velocityY.toFixed(2));

    // Update trail
    this.updateTrail();
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.trailMaterial.dispose();
    this.trail.geometry.dispose();
    this.scene.remove(this.mesh);
    this.scene.remove(this.trail);
  }
}

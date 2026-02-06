import * as THREE from 'three';

/**
 * GizmoHelper - A viewport gizmo helper similar to Blender's orientation gizmo
 * Displays orientation axes in a corner of the viewport with labels
 */
export default class GizmoHelper {
  constructor(options = {}) {
    this.alignment = options.alignment || 'bottom-right';
    this.size = options.size || 80;
    this.axisColors = options.axisColors || ['#ff0000', '#00ff00', '#0000ff'];
    this.margin = options.margin || 16;

    // Create separate scene and orthographic camera for HUD-style rendering
    this.hudScene = new THREE.Scene();
    // Increase camera bounds to prevent clipping
    const frustumSize = 1.5;
    this.hudCamera = new THREE.OrthographicCamera(
      -frustumSize,
      frustumSize,
      frustumSize,
      -frustumSize,
      0.1,
      1000,
    );
    this.hudCamera.position.set(0, 0, 5);

    // Create the gizmo
    this.createGizmo();

    // Store main camera reference (will be set externally)
    this.mainCamera = null;

    // Matrix for inverting camera rotation
    this.matrix = new THREE.Matrix4();
  }

  createAxisLabel(text, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Draw filled circle background
    context.fillStyle = color;
    context.beginPath();
    context.arc(128, 128, 120, 0, Math.PI * 2);
    context.fill();

    // Draw text - properly centered
    context.fillStyle = '#000000';
    context.font = 'bold 160px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    // Adjust Y position slightly for better vertical centering
    context.fillText(text, 128, 135);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  createGizmo() {
    this.gizmoGroup = new THREE.Group();

    // Axis configuration - adjusted for better visibility
    const axisLength = 0.7;
    const lineWidth = 0.025;
    const labelSize = 0.35;
    const labelDistance = axisLength + labelSize / 2 + 0.05;
    const negativeCircleSize = 0.2;
    const negativeCircleDistance = axisLength + negativeCircleSize / 2 + 0.05;

    const axes = [
      {
        direction: new THREE.Vector3(1, 0, 0),
        color: this.axisColors[0],
        label: 'X',
        rotation: [0, 0, -Math.PI / 2],
      },
      {
        direction: new THREE.Vector3(0, 1, 0),
        color: this.axisColors[1],
        label: 'Y',
        rotation: [0, 0, 0],
      },
      {
        direction: new THREE.Vector3(0, 0, 1),
        color: this.axisColors[2],
        label: 'Z',
        rotation: [Math.PI / 2, 0, 0],
      },
    ];

    axes.forEach(({ direction, color, label, rotation }) => {
      const axisGroup = new THREE.Group();

      // Create line for positive axis
      const lineGeometry = new THREE.CylinderGeometry(
        lineWidth,
        lineWidth,
        axisLength,
        8,
      );
      const lineMaterial = new THREE.MeshBasicMaterial({
        color,
        depthTest: true,
        depthWrite: true,
        transparent: false,
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.y = axisLength / 2;
      axisGroup.add(line);

      // Create label sprite at the positive end
      const labelTexture = this.createAxisLabel(label, color);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        depthTest: true,
        depthWrite: false,
        sizeAttenuation: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(labelSize, labelSize, 1);
      sprite.position.y = labelDistance;
      axisGroup.add(sprite);

      // Create sphere indicator at the negative end (Blender style)
      const negativeSphereGeometry = new THREE.SphereGeometry(negativeCircleSize / 2, 16, 16);
      const negativeSphereMaterial = new THREE.MeshBasicMaterial({
        color,
        depthTest: true,
        depthWrite: true,
      });
      const negativeSphere = new THREE.Mesh(negativeSphereGeometry, negativeSphereMaterial);
      negativeSphere.position.y = -negativeCircleDistance;
      axisGroup.add(negativeSphere);

      // Apply rotation to align with axis direction
      axisGroup.rotation.set(...rotation);

      this.gizmoGroup.add(axisGroup);
    });

    // Add center sphere - slightly larger
    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthTest: true,
      depthWrite: true,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.gizmoGroup.add(sphere);

    this.hudScene.add(this.gizmoGroup);
  }

  setMainCamera(camera) {
    this.mainCamera = camera;
  }

  update() {
    if (!this.mainCamera) return;

    // Sync gizmo rotation with main camera (inverted)
    this.matrix.copy(this.mainCamera.matrix).invert();
    this.gizmoGroup.quaternion.setFromRotationMatrix(this.matrix);
  }

  render(renderer, canvas) {
    if (!this.mainCamera) return;

    // Save renderer state
    const currentAutoClear = renderer.autoClear;
    const currentScissorTest = renderer.getScissorTest();
    const currentViewport = new THREE.Vector4();
    renderer.getViewport(currentViewport);

    // Calculate viewport position based on alignment
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const size = this.size;
    const margin = this.margin;

    let x, y;

    if (this.alignment.includes('right')) {
      x = width - size - margin;
    } else if (this.alignment.includes('left')) {
      x = margin;
    } else if (this.alignment.includes('center')) {
      x = (width - size) / 2;
    }

    if (this.alignment.includes('bottom')) {
      y = margin;
    } else if (this.alignment.includes('top')) {
      y = height - size - margin;
    } else if (this.alignment.includes('center')) {
      y = (height - size) / 2;
    }

    // Setup viewport for gizmo rendering
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.setScissorTest(true);
    renderer.setScissor(x, y, size, size);
    renderer.setViewport(x, y, size, size);

    // Render gizmo scene
    renderer.render(this.hudScene, this.hudCamera);

    // Restore renderer state
    renderer.setScissorTest(currentScissorTest);
    renderer.setViewport(currentViewport);
    renderer.autoClear = currentAutoClear;
  }

  dispose() {
    // Cleanup geometries and materials
    this.gizmoGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}

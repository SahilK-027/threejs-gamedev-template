import * as THREE from 'three';
import vertexShader from '../../../../Shaders/DebugFloor/vertex.glsl';
import fragmentShader from '../../../../Shaders/DebugFloor/fragment.glsl';
import Game from '../../../Game.class';

export default class DebugFloor {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;

    this.setFloorInstance();
  }

  setFloorInstance() {
    const GRID_SIZE = 100;
    const fogUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['fog']]);
    this.floorGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, 1, 1);
    this.floorMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      fog: true,
      uniforms: {
        ...fogUniforms,
        uColor: { value: new THREE.Color(0x121316) },
        uLineColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        uGridFrequency: { value: GRID_SIZE },
        uLineWidth: { value: 0.005 },
        uInnerPatternLineColor: { value: new THREE.Color('lightblue') },
        uInnerPatternCount: { value: 10.0 },
        uInnerPatternWidth: { value: 0.1 },
        uInnerPatternOffset: { value: new THREE.Vector2(0.505, 0.505) },
      },
    });

    this.floorMesh = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    this.floorMesh.rotation.x = -Math.PI / 2;

    this.scene.add(this.floorMesh);
  }
}

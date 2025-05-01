import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

class App {
  // Private vars
  #threejs_;
  #camera_;
  #scene_;
  #controls_;
  #clock_;
  #mesh_;

  constructor() {
    this.#threejs_ = null;
    this.#camera_ = null;
    this.#scene_ = null;
    this.#controls_ = null;
    this.#clock_ = new THREE.Clock();
  }

  // Public methods
  Initialize() {
    this.#InitRenderer();
    this.#InitScene();
    this.#InitCamera();
    this.#InitControls();
    this.#InitObjects();
    this.#InitEvents();
  }

  Run() {
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = this.#clock_.getDelta();
      this.#Update(delta);
      this.#Render();
    };
    animate();
  }

  // Private methods
  #InitRenderer() {
    this.#threejs_ = new THREE.WebGLRenderer({ antialias: true });
    this.#threejs_.setSize(window.innerWidth, window.innerHeight);
    this.#threejs_.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.#threejs_.domElement);
  }

  #InitScene() {
    this.#scene_ = new THREE.Scene();
    this.#scene_.background = new THREE.Color(0x202020);
    this.#scene_.add(new THREE.AxesHelper(3));
  }

  #InitCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.#camera_ = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    this.#camera_.position.set(0, 1, 5);
  }

  #InitControls() {
    this.#controls_ = new OrbitControls(
      this.#camera_,
      this.#threejs_.domElement
    );
    this.#controls_.enableDamping = true;
    this.#controls_.target.set(0, 0, 0);
  }

  #InitObjects() {
    this.#mesh_ = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0x7444ff, wireframe: true })
    );
    this.#scene_.add(this.#mesh_);
  }

  #InitEvents() {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.#camera_.aspect = width / height;
      this.#camera_.updateProjectionMatrix();
      this.#threejs_.setSize(width, height);
      this.#threejs_.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  #Update(delta) {
    this.#controls_.update();
  }

  #Render() {
    this.#threejs_.render(this.#scene_, this.#camera_);
  }
}

const app = new App();
app.Initialize();
app.Run();

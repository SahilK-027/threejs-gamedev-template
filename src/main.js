import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { DebugManager } from "./utils/DebugManager";
import Stats from "three/examples/jsm/libs/stats.module.js";

class App {
  // Private vars
  #threejs_;
  #camera_;
  #scene_;
  #controls_;
  #clock_;
  #mesh_;
  #dpr_;
  #debug_;
  #perf_;

  constructor() {
    this.#threejs_ = null;
    this.#camera_ = null;
    this.#scene_ = null;
    this.#controls_ = null;
    this.#clock_ = new THREE.Clock();
    this.#dpr_ = Math.min(window.devicePixelRatio, 2);
    this.#debug_ = new DebugManager({
      title: "Three.js App",
      expanded: true,
      enabled: true,
    });
    this.#perf_ = null;
  }

  // Public methods
  initialize() {
    this.#initRenderer();
    this.#initScene();
    this.#initCamera();
    this.#initControls();
    this.#initObjects();
    this.#initEventListener();
    this.#initStats();
    this.#raf();
  }

  // Private methods
  #initRenderer() {
    this.#threejs_ = new THREE.WebGLRenderer({ antialias: true });
    this.#threejs_.setSize(window.innerWidth, window.innerHeight);
    this.#threejs_.setPixelRatio(this.#dpr_);
    document.body.appendChild(this.#threejs_.domElement);
  }

  #initScene() {
    this.#scene_ = new THREE.Scene();
    this.#scene_.background = new THREE.Color(0x121316);
  }

  #initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.#camera_ = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    this.#camera_.position.set(0, 1, 5);
  }

  #initControls() {
    this.#controls_ = new OrbitControls(
      this.#camera_,
      this.#threejs_.domElement
    );
    this.#controls_.enableDamping = true;
    this.#controls_.target.set(0, 0, 0);
  }

  #initObjects() {
    this.#mesh_ = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({
        color: "orange",
        wireframe: true,
      })
    );

    this.#debug_.addObject("Cube mat", "Cube", this.#mesh_.material, {
      wireframe: {
        label: "Enable wireframe",
        onChange: (value) => {
          this.#mesh_.material.wireframe = value;
        },
      },
      color: {
        label: "Color",
        color: { type: "float" },
      },
      transparent: {
        label: "Enable transparency",
        onChange: (value) => {
          this.#mesh_.material.transparent = value;
          this.#mesh_.material.needsUpdate = true;
        },
      },
      opacity: {
        label: "Opacity",
        onChange: (value) => {
          this.#mesh_.material.opacity = value;
        },
        min: 0,
        max: 1,
        step: 0.01,
      },
    });

    const PARAMS = {
      offset2D: {
        x: 0,
        y: 0,
      },
    };

    this.#debug_.addObject("Cube position", "Cube", PARAMS, {
      offset2D: {
        label: "Cube position",
        onChange: (value) => {
          this.#mesh_.position.set(value.x, value.y, 0);
        },
      },
    });

    this.#debug_.addObject("Cube scale", "Cube", this.#mesh_, {
      scale: {
        label: "Cube scale",
        onChange: (value) => {
          this.#mesh_.scale.set(value);
        },
      },
    });

    this.#scene_.add(this.#mesh_);
  }

  #initEventListener() {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.#camera_.aspect = width / height;
      this.#camera_.updateProjectionMatrix();
      this.#threejs_.setSize(width, height);
      this.#threejs_.setPixelRatio(this.#dpr_);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "h") {
        this.#debug_.toggle();
      }
    });
  }

  #initStats() {
    this.#perf_ = new Stats();
    document.body.appendChild(this.#perf_.dom);
  }

  #raf() {
    requestAnimationFrame(() => {
      this.#perf_.begin();
      const delta = this.#clock_.getDelta();
      this.#stepUpdate(delta);
      this.#render();
      this.#perf_.end();
      this.#raf();
    });
  }

  #stepUpdate(delta) {
    // Game state updates
    this.#controls_.update(delta);
    this.#mesh_.rotation.y += delta;
  }

  #render() {
    this.#threejs_.render(this.#scene_, this.#camera_);
  }
}

const app = new App();
app.initialize();

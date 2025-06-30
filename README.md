# Three.js Game Development Template

Three.js template for game development with a well-structured architecture, asset, performance management, and debugging tools.

<img width="100%" alt="thumbnail" src="./thumbnail.gif" />

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/SahilK-027/threejs-gamedev-template.git
cd threejs-gamedev-template

# Install dependencies
npm ci

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
threejs-gamedev-template/
├── public/
│   ├── assets/                             # Game assets
│   │   ├── models/                         # 3D models (GLTF/GLB)
│   │   └── textures/                       # Textures and materials
│   └── draco/                              # Draco compression files
│
├── src/
│   ├── Game/
│   │   ├── Core/                           # Core engine components
│   │   │   ├── Camera.class.js             # Camera with OrbitControls
│   │   │   └── Renderer.class.js           # WebGL renderer setup
│   │   │
│   │   ├── Input/                          # User input handling
│   │   │   └── Keyboard.class.js           # Keyboard input management
│   │   │
│   │   ├── Entities/                       # Game specific components and characters
│   │   │   ├── Player.class.js             # Player entity
│   │   │   └── Enemy.class.js              # Enemy entities
│   │   │
│   │   ├── Scenes/                         # Game scenes and levels
│   │   │   └── WorldScene/                 # Main world scene
│   │   │       ├── components/             # Scene-specific components
│   │   │       │   ├── Lighting/           # Scene lighting setup
│   │   │       │   └── DebugFloor/         # Custom shader floor
│   │   │       └── World.scene.js
│   │   │
│   │   ├── Systems/                        # Game systems and managers
│   │   │   └── PhysicsSystem.class.js      # Physics and collision detection
│   │   │
│   │   ├── Utils/                          # Utility classes
│   │   │   ├── DebugGUI.js                 # Debug interface
│   │   │   ├── EventEmitter.class.js       # Event system
│   │   │   ├── PerformanceMonitor.js       # Performance tracking
│   │   │   ├── ResourceLoader.class.js     # Asset management
│   │   │   ├── Sizes.class.js              # Responsive sizing
│   │   │   └── Time.class.js               # Animation timing
│   │   │
│   │   └── Game.class.js                   # Main game controller
│   ├── assetSources.js                     # Asset definitions
│   ├── index.js                            # Application entry point
│   └── style.scss                          # Global styles
├── index.html                              # HTML entry point
├── package.json                            # Dependencies and scripts
└── vite.config.js                          # Vite configuration
```

## 🎯 Core Components

### Game Engine (`Game.class.js`)

The main orchestrator that manages the game loop, scene, camera, renderer, and world. Implements a singleton pattern for global access.

```javascript
// Initialize the game
const game = new Game(canvas, resources);

// Access game components
const { scene, camera, renderer, world } = game;
```

### Resource Loader (`ResourceLoader.class.js`)

Advanced asset management with progress tracking, error handling, and support for multiple file formats.

### Asset Management

```javascript
// Define assets `src/assetSources.js`:
const ASSETS = [
  {
    id: 'modelName',
    type: 'gltfModel', // or 'gltfModelCompressed' for Draco
    path: '/assets/models/model.glb',
  },
  {
    id: 'textureName',
    type: 'texture', // or 'HDRITexture', 'cubeMap'
    path: '/assets/textures/texture.jpg',
  },
];

// Load assets
const resources = new ResourceLoader(ASSETS);
resources.on('progress', ({ percent }) => console.log(`${percent}% loaded`));
resources.on('loaded', () => console.log('All assets loaded!'));
```

### Debug GUI (`DebugGUI.js`)

Interactive debugging interface with automatic type detection and folder organization.

```javascript
// Add controls to debug GUI
debug.add(
  material.uniforms.uSpeed,
  'value',
  {
    min: 0,
    max: 10,
    step: 0.01,
    label: 'Animation Speed',
  },
  'Animation'
);

debug.add(
  object.position,
  'position',
  {
    min: -10,
    max: 10,
    step: 0.1,
    label: 'Object Position',
  },
  'Transform'
);
```

### Eventemitter System (`EventEmitter.class.js`)

Custom event emitter for decoupled communication between components.

```javascript
// Subscribe to events
this.on('eventName', (data) => {
  console.log('Event received:', data);
});

// Emit events
this.trigger('eventName', { key: 'value' });
```

## 🔧 Configuration

### Vite Configuration

The project uses Vite with GLSL plugin for shader support:

```javascript
// vite.config.js
import glsl from 'vite-plugin-glsl';

export default {
  plugins: [glsl()],
};
```

## 🎮 Adding New Features

### Creating a New Scene Component

```javascript
// src/Game/Scenes/WorldScene/components/MyComponent/MyComponent.class.js
import * as THREE from 'three';
import Game from '../../../../Game.class';

export default class MyComponent {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;

    this.setup();
  }

  setup() {
    // Your component logic here
  }

  update() {
    // Update logic called each frame
  }
}
```

## 🙏 Acknowledgments

- **Three.js**: The amazing 3D library that makes this all possible
- **Vite**: Fast build tool for modern web development
- **lil-gui**: Lightweight debug GUI library
- **three-perf**: Performance monitoring utilities

**Happy Game Development! 🎮✨**

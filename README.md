# Three.js Game Development Template

Three.js template for game development with a well-structured architecture, asset management, performance monitoring, and debugging tools.

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

### Debug Mode

Add `?mode=debug` to the URL to enable debug mode with performance monitoring and GUI controls.

## 📁 Project Structure

```
threejs-gamedev-template/
├── public/
│   ├── assets/
│   │   ├── models/                         # 3D models (GLB with Draco compression)
│   │   └── textures/                       # Textures (environment maps, materials)
│   └── draco/                              # Draco decoder files
│
├── src/
│   ├── Config/
│   │   └── assets.js                       # Asset definitions
│   │
│   ├── Game/
│   │   ├── Core/
│   │   │   ├── Camera.class.js             # Camera with OrbitControls
│   │   │   └── Renderer.class.js           # WebGL renderer setup
│   │   │
│   │   ├── Entities/
│   │   │   ├── Player1.class.js            # Player 1 entity
│   │   │   └── Player2.class.js            # Player 2 entity
│   │   │
│   │   ├── Input/
│   │   │   └── Keyboard.class.js           # Keyboard input management
│   │   │
│   │   ├── Systems/
│   │   │   └── PhysicsSystem.class.js      # Physics and collision detection
│   │   │
│   │   ├── Utils/
│   │   │   ├── DebugGUI.class.js           # lil-gui debug interface
│   │   │   ├── DebugPane.class.js          # Tweakpane debug interface
│   │   │   ├── EventEmitter.class.js       # Event system
│   │   │   ├── Math.class.js               # Math utilities
│   │   │   ├── Performance.class.js        # Performance monitoring
│   │   │   ├── ResourceLoader.class.js     # Asset loading with progress
│   │   │   ├── Sizes.class.js              # Responsive sizing
│   │   │   └── Time.class.js               # Animation timing
│   │   │
│   │   ├── World/
│   │   │   ├── Components/
│   │   │   │   ├── BouncingBall/           # Bouncing ball component
│   │   │   │   ├── DebugFloor/             # Custom shader floor
│   │   │   │   ├── Lighting/               # Scene lighting
│   │   │   │   └── Stage/                  # Stage component
│   │   │   └── World.scene.js              # Main world scene
│   │   │
│   │   └── Game.class.js                   # Main game controller (singleton)
│   │
│   ├── Shaders/
│   │   └── DebugFloor/                     # Custom GLSL shaders
│   │
│   ├── index.js                            # Application entry point
│   └── style.scss                          # Global styles
│
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Core Components

### Game Engine (`Game.class.js`)

Singleton orchestrator managing the game loop, scene, camera, renderer, and world.

```javascript
const game = new Game(canvas, resources, isDebugMode);

// Access anywhere via singleton
const game = Game.getInstance();
const { scene, camera, renderer, world } = game;
```

### Resource Loader

Asset management with progress tracking and support for multiple formats.

```javascript
// Define assets in src/Config/assets.js
const ASSETS = [
  {
    id: 'player1Model',
    type: 'gltfModelCompressed',  // Draco-compressed GLTF
    path: ['/assets/models/model.glb'],
  },
  {
    id: 'textureName',
    type: 'texture',  // Also: 'cubeMap', 'HDRITexture'
    path: ['/assets/textures/texture.jpg'],
  },
];

// Load with progress events
const resources = new ResourceLoader(ASSETS);
resources.on('progress', ({ percent }) => console.log(`${percent}%`));
resources.on('loaded', () => initGame());
```

### Event System

Decoupled communication between components.

```javascript
// Subscribe
this.on('eventName', (data) => handleEvent(data));

// Emit
this.trigger('eventName', { key: 'value' });
```

## 🎮 Adding New Features

### Creating a World Component

```javascript
// src/Game/World/Components/MyComponent/MyComponent.class.js
import * as THREE from 'three';
import Game from '../../../Game.class';

export default class MyComponent {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.setup();
  }

  setup() {
    // Initialize component
  }

  update() {
    // Called each frame
  }
}
```

## 🔧 Tech Stack

- **Three.js** - 3D rendering
- **Vite** - Build tool with GLSL plugin
- **Tweakpane / lil-gui** - Debug interfaces
- **three-perf** - Performance monitoring
- **Sass** - Styling
- **Draco** - Model compression

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D library
- [Vite](https://vitejs.dev/) - Build tool
- [lil-gui](https://lil-gui.georgealways.com/) - Debug GUI
- [Tweakpane](https://tweakpane.github.io/docs/) - Debug pane
- [three-perf](https://github.com/utsuboco/three-perf) - Performance monitoring

**Happy Game Development! 🎮✨**

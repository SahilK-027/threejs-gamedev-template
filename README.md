```
src/
└── Game/
    ├── Core/                # fundamental bits that everything else builds on
    │   ├── Game.class.js
    │   ├── Camera.class.js   ← here
    │   └── Renderer.class.js
    │
    ├── Input/               # classes that handle user input
    │   └── Keyboard.class.js
    │
    ├── Entities/            # your moving “things” in the world
    │   ├── Player.class.js
    │   └── Enemy.class.js
    │
    ├── Scenes/              # collections of entities + logic for each game screen/level
    │   └── Level1.scene.js
    │
    ├── Systems/             # update loops / managers (collision, physics, audio…)
    │   └── PhysicsSystem.js
    │
    ├── Utils/               # pure helpers that could be extracted to other projects
    │   ├── EventEmitter.class.js
    │   ├── Sizes.class.js
    │   └── Time.class.js
    │
    ├── index.js
    └── style.scss

```
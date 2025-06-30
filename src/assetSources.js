const ASSETS = [
  {
    id: 'environmentMapTexture',
    type: 'cubeMap',
    path: [
      '/assets/textures/environmentMap/px.png',
      '/assets/textures/environmentMap/nx.png',
      '/assets/textures/environmentMap/py.png',
      '/assets/textures/environmentMap/ny.png',
      '/assets/textures/environmentMap/pz.png',
      '/assets/textures/environmentMap/nz.png',
    ],
  },
  {
    id: 'rubberTilesAOMap',
    type: 'texture',
    path: ['/assets/textures/rubberTiles/ao_1k.jpg'],
  },
  {
    id: 'rubberTilesNormalMap',
    type: 'texture',
    path: ['/assets/textures/rubberTiles/normal_1k.jpg'],
  },
  {
    id: 'rubberTilesDisplacementMap',
    type: 'texture',
    path: ['/assets/textures/rubberTiles/displacement_1k.jpg'],
  },
  {
    id: 'rubberTilesDiffuseMap',
    type: 'texture',
    path: ['/assets/textures/rubberTiles/diffuse_1k.jpg'],
  },
  {
    id: 'player1Model',
    type: 'gltfModelCompressed',
    path: ['/assets/models/nix_compressed.glb'],
  },
  {
    id: 'player2Model',
    type: 'gltfModelCompressed',
    path: ['/assets/models/jade_compressed.glb'],
  },
];

export default ASSETS;

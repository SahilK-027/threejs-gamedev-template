const ASSETS = [
  {
    id: 'environmentMapHDRTexture',
    type: 'HDRITexture',
    path: ['/assets/textures/environmentMap/river_walk_1_2k.hdr'],
  },
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
    id: 'rockyTerrainAOMap',
    type: 'texture',
    path: ['/assets/textures/rockyTerrain/ao_1k.jpg'],
  },
  {
    id: 'rockyTerrainNormalMap',
    type: 'texture',
    path: ['/assets/textures/rockyTerrain/normal_1k.jpg'],
  },
  {
    id: 'rockyTerrainDisplacementMap',
    type: 'texture',
    path: ['/assets/textures/rockyTerrain/displacement_1k.jpg'],
  },
  {
    id: 'rockyTerrainDiffuseMap',
    type: 'texture',
    path: ['/assets/textures/rockyTerrain/diffuse_1k.jpg'],
  },
  {
    id: 'lionModel',
    type: 'gltfModel',
    path: ['/assets/models/white_tiger_rigged_animated.glb'],
  },
];

export default ASSETS;

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
    type: 'gltfModelDracoCompressed',
    path: '/assets/models/nix_compressed.glb',
  },
  {
    id: 'player2Model',
    type: 'gltfModelDracoKTX2Compressed',
    path: '/assets/models/jade_compressed_KTX2.glb',
  },
  {
    id: 'bgmBrattEveretAlmond',
    type: 'audio',
    path: '/assets/audio/bgm/Bratt_Everet_Almond.mp3',
  },
  {
    id: 'sfxNixLaugh',
    type: 'audio',
    path: '/assets/audio/sfx/nix_laugh.mp3',
  },
];

export default ASSETS;

/**
 * Asset Type Reference:
 *
 * - 'texture'                      → Standard 2D textures (JPG, PNG) - diffuse maps, normal maps, AO maps, etc.
 * - 'cubeMap'                      → Environment maps (6 faces: px, nx, py, ny, pz, nz)
 * - 'HDRITexture'                  → High Dynamic Range images (.hdr, .exr) for realistic lighting
 * - 'gltfModel'                    → Uncompressed glTF/GLB 3D models
 * - 'gltfModelDracoCompressed'     → glTF/GLB with Draco geometry compression
 * - 'gltfModelKTX2Compressed'      → glTF/GLB with KTX2 texture compression
 * - 'gltfModelDracoKTX2Compressed' → glTF/GLB with Draco geometry + KTX2 texture compression
 * - 'font'                         → Three.js JSON fonts for 3D text
 * - 'audio'                        → Audio files (MP3, OGG, WAV) decoded via Web Audio API
 *
 * Note: All types are handled by ResourceLoader.class.js with THREE.LoadingManager
 */

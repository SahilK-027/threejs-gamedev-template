import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as THREE from 'three';
import EventEmitter from './EventEmitter.class';

export default class ResourceLoader extends EventEmitter {
  constructor(assets, isDebugMode) {
    super();

    this.sources = assets;
    this.items = {};
    this.sourceByUrl = {};

    // Build a map of every URL → its src record
    this.sources.forEach((src) => {
      const paths = Array.isArray(src.path) ? src.path : [src.path];
      paths.forEach((url) => {
        this.sourceByUrl[url] = src;
      });

      try {
        if (typeof window !== 'undefined') {
          const abs = new URL(paths[0], window.location.href).href;
          this.sourceByUrl[abs] = src;
        }
      } catch (e) {
        console.error('Error adding source by URL:', e);
      }
    });

    // Total URLs we expect Three.js to load
    this.toLoad = Object.keys(this.sourceByUrl).length;
    this.loaded = 0;

    // Create and wire the manager
    this.manager = new THREE.LoadingManager();

    this.manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      let urlKey;
      if (typeof _url === 'string') {
        urlKey = _url;
      } else if (Array.isArray(_url) && _url.length) {
        // CubeTextureLoader passes an array of URLs
        urlKey = _url[0];
      } else if (_url && typeof _url === 'object') {
        // Some loaders pass objects with url/src fields
        urlKey = _url.url || _url.src || JSON.stringify(_url);
      } else {
        urlKey = String(_url);
      }

      const src = this.sourceByUrl[urlKey];
      const id = src ? src.id : urlKey;
      const file =
        typeof urlKey === 'string' && urlKey.indexOf('/') !== -1
          ? urlKey.substring(urlKey.lastIndexOf('/') + 1)
          : urlKey;

      this.loaded = itemsLoaded;

      this.trigger('progress', {
        id: `${id} - ${file}`,
        itemsLoaded,
        itemsTotal,
        percent: (itemsLoaded / itemsTotal) * 100,
      });
    };

    this.manager.onLoad = () => {
      this.trigger('loaded', {
        itemsLoaded: this.toLoad,
        itemsTotal: this.toLoad,
        percent: 100,
      });
    };

    this.manager.onError = (url) => {
      let urlKey;
      if (typeof url === 'string') urlKey = url;
      else if (Array.isArray(url) && url.length) urlKey = url[0];
      else if (url && typeof url === 'object')
        urlKey = url.url || url.src || JSON.stringify(url);
      else urlKey = String(url);

      const src = this.sourceByUrl[urlKey];
      const id = src ? src.id : urlKey;

      this.trigger('error', {
        id,
        url: urlKey,
        itemsLoaded: this.loaded,
        itemsTotal: this.toLoad,
      });
    };

    this.setLoaders();
    this.initLoading();

    // If there was nothing to load, fire the loaded event right away
    if (this.toLoad === 0) {
      // Give the manager a tick to settle, then call onLoad
      setTimeout(() => this.manager.onLoad(), 0);
    }
  }

  setLoaders() {
    // feed the manager into each loader
    this.loaders = {};

    // Draco loader for geometry compression
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    this.loaders.dracoLoader = dracoLoader;

    // KTX2 loader for texture compression
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/basis/');

    // Detect support - create a temporary renderer if needed
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const tempRenderer = new THREE.WebGLRenderer({ canvas });
        ktx2Loader.detectSupport(tempRenderer);
        tempRenderer.dispose();
        canvas.remove();
      } catch (e) {
        console.warn('Could not detect KTX2 support:', e);
      }
    }

    this.loaders.ktx2Loader = ktx2Loader;

    // glTF loaders with different compression configurations
    // Uncompressed GLTF
    this.loaders.gltfLoader = new GLTFLoader(this.manager);

    // GLTF with Draco compression
    this.loaders.gltfDracoLoader = new GLTFLoader(this.manager);
    this.loaders.gltfDracoLoader.setDRACOLoader(dracoLoader);

    // GLTF with KTX2 texture compression
    this.loaders.gltfKTX2Loader = new GLTFLoader(this.manager);
    this.loaders.gltfKTX2Loader.setKTX2Loader(ktx2Loader);

    // GLTF with both Draco and KTX2 compression
    this.loaders.gltfDracoKTX2Loader = new GLTFLoader(this.manager);
    this.loaders.gltfDracoKTX2Loader.setDRACOLoader(dracoLoader);
    this.loaders.gltfDracoKTX2Loader.setKTX2Loader(ktx2Loader);

    // textures
    this.loaders.textureLoader = new THREE.TextureLoader(this.manager);
    this.loaders.hdriLoader = new HDRLoader(this.manager);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.manager);

    // fonts
    this.loaders.fontLoader = new FontLoader(this.manager);

    // audio context for audio loading
    this.audioContext = null;
    if (
      typeof window !== 'undefined' &&
      (window.AudioContext || window.webkitAudioContext)
    ) {
      this.audioContext = new (
        window.AudioContext || windowy.webkitAudioContext
      )();
    }
  }

  initLoading() {
    for (const source of this.sources) {
      const { type, path, id } = source;

      const onLoad = (file) => {
        this.items[id] = file;
      };
      const onProgress = undefined;

      switch (type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(path, onLoad, onProgress);
          break;
        case 'gltfModelDracoCompressed':
          this.loaders.gltfDracoLoader.load(path, onLoad, onProgress);
          break;
        case 'gltfModelKTX2Compressed':
          this.loaders.gltfKTX2Loader.load(path, onLoad, onProgress);
          break;
        case 'gltfModelDracoKTX2Compressed':
          this.loaders.gltfDracoKTX2Loader.load(path, onLoad, onProgress);
          break;
        case 'texture':
          this.loaders.textureLoader.load(path, onLoad, onProgress);
          break;
        case 'HDRITexture':
          this.loaders.hdriLoader.load(path, onLoad, onProgress);
          break;
        case 'cubeMap':
          this.loaders.cubeTextureLoader.load(path, onLoad, onProgress);
          break;
        case 'font':
          this.loaders.fontLoader.load(path, onLoad, onProgress);
          break;
        case 'audio':
          this.loadAudio(path, id);
          break;
        default:
          console.warn(`Unknown asset type: ${type}`);
      }
    }
  }

  loadAudio(path, id) {
    if (!this.audioContext) {
      console.warn('AudioContext not available, skipping audio load:', id);
      this.manager.itemEnd(path);
      return;
    }

    this.manager.itemStart(path);

    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load audio: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        this.items[id] = audioBuffer;
        this.manager.itemEnd(path);
      })
      .catch((error) => {
        console.error(`Error loading audio ${id}:`, error);
        this.manager.itemError(path);
      });
  }
}

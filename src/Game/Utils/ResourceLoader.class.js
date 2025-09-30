import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
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

    // Draco‐compression for glTF‑compressed
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.loaders.dracoLoader = dracoLoader;

    // glTF loaders
    this.loaders.gltfCompressLoader = new GLTFLoader(this.manager);
    this.loaders.gltfCompressLoader.setDRACOLoader(dracoLoader);
    this.loaders.gltfLoader = new GLTFLoader(this.manager);

    // textures
    this.loaders.textureLoader = new THREE.TextureLoader(this.manager);
    this.loaders.hdriLoader = new RGBELoader(this.manager);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.manager);
  }

  initLoading() {
    for (const source of this.sources) {
      const { type, path, id } = source;

      const onLoad = (file) => {
        this.items[id] = file;
      };
      const onProgress = undefined;

      switch (type) {
        case 'gltfModelCompressed':
          this.loaders.gltfCompressLoader.load(path, onLoad, onProgress);
          break;
        case 'gltfModel':
          this.loaders.gltfLoader.load(path, onLoad, onProgress);
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
        default:
          console.warn(`Unknown asset type: ${type}`);
      }
    }
  }
}

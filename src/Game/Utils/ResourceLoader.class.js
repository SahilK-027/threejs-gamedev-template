import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import * as THREE from 'three';
import EventEmitter from './EventEmitter.class';

export default class ResourceLoader extends EventEmitter {
  constructor(assets) {
    super();

    this.sources = assets;
    this.items = {};
    this.sourceByUrl = {};
    this.sources.forEach((src) => {
      // if path is an array, register each URL…
      if (Array.isArray(src.path)) {
        src.path.forEach((url) => {
          this.sourceByUrl[url] = src;
        });
      }
      // …otherwise just the one
      else {
        this.sourceByUrl[src.path] = src;
      }
    });

    // total to load
    this.toLoad = this.sources.length;
    this.loaded = 0;

    // create a central manager
    this.manager = new THREE.LoadingManager();

    // hook up manager callbacks
    this.manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      this.loaded = itemsLoaded;
      const percent = (itemsLoaded / itemsTotal) * 100;

      const src = this.sourceByUrl[_url];
      const id = src ? src.id : _url;
      const file = _url.toString().substring(_url.lastIndexOf('/') + 1);
      const uniqueFile = `${id} - ${file}`;

      this.trigger('progress', {
        id: uniqueFile,
        itemsLoaded,
        itemsTotal,
        percent,
      });
    };

    this.manager.onLoad = () => {
      // all done
      this.trigger('loaded', {
        itemsLoaded: this.toLoad,
        itemsTotal: this.toLoad,
        percent: 100,
      });
    };

    this.manager.onError = (url) => {
      const src = this.sourceByUrl[url];
      const id = src ? src.id : url;

      this.trigger('error', {
        id,
        url,
        itemsLoaded: this.loaded,
        itemsTotal: this.toLoad,
      });
    };

    this.setLoaders();
    this.initLoading();
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

import * as THREE from "three";
import { Pane } from "tweakpane";

/**
 * DebugManager encapsulates a Tweakpane panel for debugging and tweaking
 * Three.js scenes and objects.
 */
export class DebugManager {
  #pane;
  #folders;
  #objects;
  #enabled;

  /**
   * Construct a new DebugManager.
   * @param {object} [options] - Configuration options.
   * @param {string} [options.title="Debug"] - Pane title.
   * @param {boolean} [options.expanded=true] - Whether pane starts expanded.
   * @param {boolean} [options.enabled=true] - Flag to enable or disable debugging.
   */
  constructor(options = {}) {
    const { title = "Debug", expanded = true, enabled = true } = options;

    this.#enabled = enabled;
    this.#folders = new Map();
    this.#objects = new Map();

    if (this.#enabled) {
      this.#pane = new Pane({ title, expanded });
    }
  }

  /**
   * Retrieve or create a folder within the pane.
   * @param {string} name - Folder name.
   * @param {object} [options] - Folder options.
   * @param {boolean} [options.expanded=true] - Folder expanded state.
   * @returns {import('tweakpane').FolderApi|null} The folder API or null if disabled.
   */
  getFolder(name, options = {}) {
    if (!this.#enabled) return null;

    if (!this.#folders.has(name)) {
      this.#folders.set(
        name,
        this.#pane.addFolder({
          title: name,
          expanded: options.expanded ?? true,
        })
      );
    }
    return this.#folders.get(name);
  }

  /**
   * Add an object with multiple tweakable parameters.
   * @param {string} objectId - Unique identifier for the object.
   * @param {string} folderName - Folder under which to group controls.
   * @param {object} object - The target object containing properties.
   * @param {object} params - Mapping of property keys to config or handler function.
   * @returns {object} The original object.
   */
  addObject(objectId, folderName, object, params = {}) {
    if (!this.#enabled) return object;

    if (this.#objects.has(objectId)) {
      console.warn(`Object with ID ${objectId} already exists in debug panel`);
      return this.#objects.get(objectId);
    }

    const folder = this.getFolder(folderName);
    this.#objects.set(objectId, object);

    Object.entries(params).forEach(([propKey, config]) => {
      // Custom handler functions
      if (typeof config === "function") {
        config(folder, object, propKey);
      } else {
        const paramConfig = { label: config.label || propKey, ...config };

        // THREE.Color -> color picker
        if (object[propKey] instanceof THREE.Color) {
          folder.addBinding(object, propKey, {
            label: paramConfig.label,
            color: { type: "float" },
          });
        }
        // Vector3 -> separate sliders for x, y, z
        else if (object[propKey] instanceof THREE.Vector3) {
          ["x", "y", "z"].forEach((axis) => {
            folder.addBinding(object[propKey], axis, {
              label: `${paramConfig.label} ${axis.toUpperCase()}`,
              min: paramConfig.min ?? -10,
              max: paramConfig.max ?? 10,
              step: paramConfig.step ?? 0.1,
            });
          });
        }
        // Regular properties
        else {
          const input = folder.addBinding(object, propKey, paramConfig);
          if (config.onChange) {
            input.on("change", (ev) => {
              config.onChange(ev.value, object, propKey);
            });
          }
        }
      }
    });

    return object;
  }

  /**
   * Add a button control to invoke a callback.
   * @param {string} folderName - Folder name.
   * @param {string} label - Button text.
   * @param {Function} onClick - Click handler function.
   * @returns {import('tweakpane').ButtonApi|null} The button API or null if disabled.
   */
  addButton(folderName, label, onClick) {
    if (!this.#enabled) return null;

    const folder = this.getFolder(folderName);
    const button = folder.addButton({ title: label });
    button.on("click", onClick);
    return button;
  }

  /**
   * Add a standalone value input (e.g., slider) with change callback.
   * @param {string} folderName - Folder to contain the input.
   * @param {string} label - Label for the input.
   * @param {any} initialValue - Starting value.
   * @param {object} options - Input options (min, max, step, onChange).
   * @returns {object} Wrapper containing the current value.
   */
  addValue(folderName, label, initialValue, options = {}) {
    if (!this.#enabled) return { value: initialValue };

    const params = { value: initialValue };
    const folder = this.getFolder(folderName);

    const input = folder.addBinding(params, "value", {
      label,
      ...this.#getDefaultOptions(initialValue, options),
    });

    if (options.onChange) {
      input.on("change", (ev) => options.onChange(ev.value, params));
    }

    return params;
  }

  /**
   * Internal: derive default min/max/step for numeric values.
   * @private
   */
  #getDefaultOptions(value, userOptions) {
    const options = { ...userOptions };
    if (typeof value === "number") {
      if (options.min === undefined) options.min = value > 0 ? 0 : value * 2;
      if (options.max === undefined) options.max = value > 0 ? value * 2 : 0;
      if (options.step === undefined)
        options.step = Math.abs(value) / 100 || 0.01;
    }
    return options;
  }

  /**
   * Retrieve a previously added object by its ID.
   * @param {string} objectId - Identifier used in addObject.
   * @returns {object|null}
   */
  getObject(objectId) {
    return this.#objects.get(objectId) || null;
  }

  /**
   * Remove an object from internal tracking (does not remove UI).
   * @param {string} objectId - Identifier of the object to remove.
   */
  removeObject(objectId) {
    this.#objects.delete(objectId);
  }

  /**
   * Toggle visibility of the entire debug pane.
   */
  toggle() {
    if (!this.#enabled) return;
    this.#pane.hidden = !this.#pane.hidden;
  }

  /**
   * Dispose of the pane and clear all folders and objects.
   */
  dispose() {
    if (this.#enabled && this.#pane) {
      this.#pane.dispose();
    }
    this.#folders.clear();
    this.#objects.clear();
  }
}

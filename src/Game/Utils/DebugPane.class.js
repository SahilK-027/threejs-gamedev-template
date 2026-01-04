/**
 * DebugPane.class.js - Tweakpane-based Debug Panel
 * ================================================
 *
 * A powerful debug UI wrapper around Tweakpane with automatic type detection.
 * Provides a clean, minimal dark theme with purple accents.
 *
 * @module DebugPane
 * @version 1.0.0
 * @see https://tweakpane.github.io/docs/
 *
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 * 1. INITIALIZATION
 * 2. BASIC CONTROLS (Numbers, Booleans, Strings)
 * 3. COLOR PICKERS
 * 4. DROPDOWNS / SELECT
 * 5. VECTORS (Vector2, Vector3)
 * 6. MONITORS (Real-time value display)
 * 7. BUTTONS & SEPARATORS
 * 8. FOLDERS
 * 9. TABS
 * 10. UTILITY METHODS
 * 11. SINGLETON PATTERN
 *
 * ============================================================================
 * 1. INITIALIZATION
 * ============================================================================
 *
 * Basic setup (singleton pattern - only one instance exists):
 *
 *   import DebugPane from './Utils/DebugPane.class.js';
 *
 *   // In your main Game class constructor:
 *   this.debug = new DebugPane();
 *
 *   // Anywhere else in your app, get the same instance:
 *   const debug = DebugPane.getInstance();
 *
 * With options:
 *
 *   const debug = new DebugPane({
 *     title: 'My Debug Panel',  // Panel title (default: 'Debug')
 *     expanded: true,           // Start expanded (default: true)
 *     container: myElement,     // Custom container element (optional)
 *   });
 *
 * ============================================================================
 * 2. BASIC CONTROLS
 * ============================================================================
 *
 * The .add() method auto-detects the control type based on the value.
 *
 * NUMBER SLIDER:
 *   debug.add(object, 'property', {
 *     min: 0,           // Minimum value
 *     max: 100,         // Maximum value
 *     step: 1,          // Step increment (optional)
 *     label: 'Speed',   // Display label (optional, defaults to property name)
 *     onChange: (v) => console.log(v),  // Callback on change (optional)
 *   }, 'Folder Name');  // Folder name (optional, null = root)
 *
 *   // Examples:
 *   debug.add(player, 'speed', { min: 0, max: 20, step: 0.5 }, 'Player');
 *   debug.add(camera, 'fov', { min: 30, max: 120, label: 'Field of View' });
 *   debug.add(light, 'intensity', { min: 0, max: 5, step: 0.1 }, 'Lighting');
 *
 * BOOLEAN CHECKBOX:
 *   debug.add(object, 'enabled', { label: 'Enable Feature' }, 'Settings');
 *
 *   // Examples:
 *   debug.add(renderer, 'shadowMap.enabled', { label: 'Shadows' });
 *   debug.add(material, 'wireframe', { label: 'Wireframe' }, 'Material');
 *   debug.add(controls, 'enableDamping', { label: 'Smooth Camera' });
 *
 * STRING INPUT:
 *   debug.add(object, 'name', { label: 'Player Name' }, 'Player');
 *
 * ============================================================================
 * 3. COLOR PICKERS
 * ============================================================================
 *
 * Colors are auto-detected for THREE.Color or hex strings (#RRGGBB).
 * Force color mode with { color: true }.
 *
 *   // THREE.Color (auto-detected):
 *   debug.add(material, 'color', { label: 'Diffuse' }, 'Material');
 *
 *   // Hex string (auto-detected):
 *   const settings = { bgColor: '#1a1a2e' };
 *   debug.add(settings, 'bgColor', { label: 'Background' });
 *
 *   // Force color picker:
 *   debug.add(uniforms.uColor, 'value', { color: true, label: 'Tint' });
 *
 *   // With onChange callback:
 *   debug.add(scene, 'background', {
 *     color: true,
 *     label: 'Scene BG',
 *     onChange: (color) => {
 *       renderer.setClearColor(color);
 *     }
 *   });
 *
 * ============================================================================
 * 4. DROPDOWNS / SELECT
 * ============================================================================
 *
 * Use { options: {...} } to create a dropdown.
 *
 *   // Object format (label: value):
 *   debug.add(renderer, 'toneMapping', {
 *     options: {
 *       'None': THREE.NoToneMapping,
 *       'Linear': THREE.LinearToneMapping,
 *       'Reinhard': THREE.ReinhardToneMapping,
 *       'ACES Filmic': THREE.ACESFilmicToneMapping,
 *     },
 *     label: 'Tone Mapping',
 *     onChange: (v) => renderer.toneMapping = v,
 *   }, 'Renderer');
 *
 *   // Array format (value = label):
 *   debug.add(settings, 'quality', {
 *     options: ['Low', 'Medium', 'High', 'Ultra'],
 *     label: 'Quality',
 *   }, 'Graphics');
 *
 *   // Enum-style:
 *   debug.add(player, 'state', {
 *     options: { Idle: 0, Walking: 1, Running: 2, Jumping: 3 },
 *     label: 'State',
 *   }, 'Player');
 *
 * ============================================================================
 * 5. VECTORS (Vector2, Vector3)
 * ============================================================================
 *
 * Vectors are auto-detected (THREE.Vector2/3 or plain {x, y, z} objects).
 * Creates a sub-folder with X, Y, Z sliders.
 *
 *   // THREE.Vector3:
 *   debug.add(mesh, 'position', {
 *     min: -10,
 *     max: 10,
 *     step: 0.1,
 *     label: 'Position',
 *   }, 'Transform');
 *
 *   // THREE.Vector2:
 *   debug.add(material, 'normalScale', {
 *     min: 0,
 *     max: 2,
 *     label: 'Normal Scale',
 *   }, 'Material');
 *
 *   // Plain object {x, y, z}:
 *   const offset = { x: 0, y: 0, z: 0 };
 *   debug.add({ offset }, 'offset', {
 *     min: -5,
 *     max: 5,
 *     onChange: (v) => mesh.position.copy(v),
 *   }, 'Transform');
 *
 *   // Rotation (Euler angles):
 *   debug.add(mesh, 'rotation', {
 *     min: -Math.PI,
 *     max: Math.PI,
 *     step: 0.01,
 *     label: 'Rotation',
 *   }, 'Transform');
 *
 * ============================================================================
 * 6. MONITORS (Real-time value display)
 * ============================================================================
 *
 * Monitors display read-only values that update automatically.
 * Great for FPS, memory, positions, etc.
 *
 *   // Simple text monitor:
 *   debug.addMonitor(stats, 'fps', { label: 'FPS' }, 'Performance');
 *
 *   // Graph monitor (shows history):
 *   debug.addMonitor(stats, 'fps', {
 *     label: 'FPS',
 *     graph: true,      // Show as graph
 *     min: 0,           // Graph Y-axis min
 *     max: 144,         // Graph Y-axis max
 *   }, 'Performance');
 *
 *   // Custom update interval:
 *   debug.addMonitor(player, 'health', {
 *     label: 'Health',
 *     interval: 100,    // Update every 100ms (default: 200ms)
 *   }, 'Player');
 *
 *   // Multi-line text:
 *   debug.addMonitor(logger, 'lastMessage', {
 *     label: 'Log',
 *     rows: 3,          // Number of text rows
 *   }, 'Debug');
 *
 * ============================================================================
 * 7. BUTTONS & SEPARATORS
 * ============================================================================
 *
 * BUTTONS:
 *   debug.addButton({
 *     label: 'Reset Camera',
 *     onClick: () => camera.position.set(0, 5, 10),
 *   }, 'Actions');
 *
 *   debug.addButton({
 *     label: 'Screenshot',
 *     onClick: () => saveScreenshot(),
 *   }, 'Actions');
 *
 *   debug.addButton({
 *     label: 'Reload Scene',
 *     onClick: () => location.reload(),
 *   });  // Root level (no folder)
 *
 * SEPARATORS:
 *   debug.addSeparator('Settings');  // Add separator line in folder
 *   debug.addSeparator();            // Add separator at root
 *
 * ============================================================================
 * 8. FOLDERS
 * ============================================================================
 *
 * Folders are created automatically when you pass a folder name to .add().
 * You can also create them manually:
 *
 *   // Auto-created (recommended):
 *   debug.add(obj, 'prop1', {}, 'My Folder');
 *   debug.add(obj, 'prop2', {}, 'My Folder');  // Same folder
 *
 *   // Manual creation:
 *   const folder = debug.addFolder('Advanced', { expanded: true });
 *
 *   // Get existing folder:
 *   const existingFolder = debug.getFolder('My Folder');
 *
 *   // Remove folder:
 *   debug.removeFolder('My Folder');
 *
 * ============================================================================
 * 9. TABS
 * ============================================================================
 *
 * Create tabbed interfaces for complex UIs:
 *
 *   const tabs = debug.addTabs({
 *     pages: [
 *       { title: 'General' },
 *       { title: 'Advanced' },
 *       { title: 'Debug' },
 *     ]
 *   });
 *
 *   // Add controls to specific tabs:
 *   tabs.pages[0].addBinding(settings, 'volume');
 *   tabs.pages[1].addBinding(settings, 'maxParticles');
 *   tabs.pages[2].addBinding(debug, 'showWireframe');
 *
 * ============================================================================
 * 10. UTILITY METHODS
 * ============================================================================
 *
 *   // Refresh all bindings (after external value changes):
 *   debug.refresh();
 *
 *   // Show/hide the panel:
 *   debug.setEnabled(false);  // Hide
 *   debug.setEnabled(true);   // Show
 *
 *   // Toggle visibility:
 *   debug.toggle();
 *
 *   // Expand/collapse the panel:
 *   debug.setExpanded(false);
 *
 *   // Export/import state (for presets):
 *   const state = debug.exportState();
 *   localStorage.setItem('debugState', JSON.stringify(state));
 *   // Later:
 *   debug.importState(JSON.parse(localStorage.getItem('debugState')));
 *
 *   // Access raw Tweakpane instance:
 *   const pane = debug.getRawPane();
 *
 * ============================================================================
 * 11. SINGLETON PATTERN
 * ============================================================================
 *
 *   // First call creates the instance:
 *   const debug1 = new DebugPane();
 *
 *   // Subsequent calls return the same instance:
 *   const debug2 = new DebugPane();  // Same as debug1
 *   const debug3 = DebugPane.getInstance();  // Same as debug1
 *
 *   // Destroy the instance (cleanup):
 *   DebugPane.destroy();
 *   // or
 *   debug.dispose();
 *
 * ============================================================================
 * COMPLETE EXAMPLE
 * ============================================================================
 *
 *   import DebugPane from './Utils/DebugPane.class.js';
 *
 *   class Game {
 *     constructor() {
 *       this.debug = new DebugPane({ title: 'Game Debug' });
 *       this.setupDebug();
 *     }
 *
 *     setupDebug() {
 *       // Performance
 *       this.debug.addMonitor(this.stats, 'fps', {
 *         label: 'FPS', graph: true, min: 0, max: 144
 *       }, 'Performance');
 *
 *       // Camera
 *       this.debug.add(this.camera, 'fov', {
 *         min: 30, max: 120, label: 'FOV'
 *       }, 'Camera');
 *       this.debug.add(this.camera, 'position', {
 *         min: -50, max: 50, label: 'Position'
 *       }, 'Camera');
 *
 *       // Lighting
 *       this.debug.add(this.light, 'intensity', {
 *         min: 0, max: 5, label: 'Intensity'
 *       }, 'Lighting');
 *       this.debug.add(this.light, 'color', {
 *         label: 'Color'
 *       }, 'Lighting');
 *
 *       // Renderer
 *       this.debug.add(this.renderer, 'toneMapping', {
 *         options: {
 *           'None': 0, 'Linear': 1, 'Reinhard': 2, 'ACES': 4
 *         },
 *         label: 'Tone Mapping'
 *       }, 'Renderer');
 *
 *       // Actions
 *       this.debug.addButton({
 *         label: 'Reset',
 *         onClick: () => this.reset()
 *       }, 'Actions');
 *     }
 *   }
 *
 * ============================================================================
 */

import { Pane } from 'tweakpane';
import * as THREE from 'three';

const THEME = {
  bg: '#121316',
  bgSecondary: '#28292e',
  bgHover: '#1e1f23ff',
  fg: '#ffffff',
  fgSecondary: 'rgba(255, 255, 255, 0.6)',
  accent: '#7444ff',
  accentHover: '#8855ff',
  border: 'rgba(255, 255, 255, 0.08)',
  colorSelectorBorder: 'rgba(255, 255, 255, 0.2)',
};

/**
 * DebugPane - Tweakpane wrapper with DebugGUI-compatible API
 */
export default class DebugPane {
  static instance = null;

  constructor(options = {}) {
    if (DebugPane.instance) {
      return DebugPane.instance;
    }

    this.pane = null;
    this.folders = new Map();
    this.controllers = new Map();
    this.monitors = new Map();
    this.styleElement = null;

    this.options = {
      title: options.title || 'Debug',
      expanded: options.expanded !== false,
      container: options.container || null,
    };

    DebugPane.instance = this;
    this._initializePane();
  }

  _initializePane() {
    const paneOptions = {
      title: this.options.title,
      expanded: this.options.expanded,
    };

    if (this.options.container) {
      paneOptions.container = this.options.container;
    }

    this.pane = new Pane(paneOptions);
    this.pane.element.classList.add('debug-pane');
    this._injectStyles();
  }

  _injectStyles() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'debug-pane-theme';
    document.head.appendChild(this.styleElement);

    this.styleElement.textContent = `
      .debug-pane {
        position: fixed !important;
        top: 8px !important;
        right: 8px !important;
        width: 280px !important;
        max-height: calc(100vh - 16px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        z-index: 10000;
        
        /* Scrollbar styling */
        scrollbar-width: thin;
        scrollbar-color: ${THEME.accent} transparent;
        
        /* Theme variables */
        --tp-base-background-color: ${THEME.bg};
        --tp-base-shadow-color: rgba(0, 0, 0, 0.4);
        --tp-button-background-color: ${THEME.accent};
        --tp-button-background-color-active: ${THEME.accent};
        --tp-button-background-color-focus: ${THEME.accentHover};
        --tp-button-background-color-hover: ${THEME.accentHover};
        --tp-button-foreground-color: ${THEME.fg};
        --tp-container-background-color: ${THEME.bgSecondary};
        --tp-container-background-color-active: ${THEME.bgHover};
        --tp-container-background-color-focus: ${THEME.bgHover};
        --tp-container-background-color-hover: ${THEME.bgHover};
        --tp-container-foreground-color: ${THEME.fg};
        --tp-groove-foreground-color: ${THEME.border};
        --tp-input-background-color: ${THEME.bgSecondary};
        --tp-input-background-color-active: ${THEME.bgHover};
        --tp-input-background-color-focus: ${THEME.bgHover};
        --tp-input-background-color-hover: ${THEME.bgHover};
        --tp-input-foreground-color: ${THEME.fg};
        --tp-label-foreground-color: ${THEME.fgSecondary};
        --tp-monitor-background-color: ${THEME.bgSecondary};
        --tp-monitor-foreground-color: ${THEME.accent};
      }
      
      .debug-pane::-webkit-scrollbar {
        width: 4px;
      }
      
      .debug-pane::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .debug-pane::-webkit-scrollbar-thumb {
        background: ${THEME.accent};
        border-radius: 2px;
      }
      
      .debug-pane .tp-rotv {
        border: 1px solid ${THEME.border};
        border-radius: 6px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        background: ${THEME.bg};
      }
      
      .debug-pane .tp-rotv_t {
        color: ${THEME.fg};
        font-weight: 500;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .debug-pane .tp-fldv_t {
        color: ${THEME.fg};
        font-weight: 500;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      
      .debug-pane .tp-lblv_l {
        color: ${THEME.fgSecondary};
        font-size: 10px;
      }
      
      .debug-pane .tp-ckbv_m {
        background: ${THEME.accent} !important;
      }
      
      .debug-pane .tp-txtv_i,
      .debug-pane .tp-lstv_s {
        background: ${THEME.bgSecondary};
        border: 1px solid ${THEME.border};
        color: ${THEME.fg};
        font-size: 11px;
      }
      
      .debug-pane .tp-btnv_b {
        background: ${THEME.accent};
        color: ${THEME.fg};
        font-weight: 500;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        border-radius: 3px;
      }
      
      .debug-pane .tp-btnv_b:hover {
        background: ${THEME.accentHover};
      }
      
      .debug-pane .tp-fldv_c {
        border-left: 1px solid ${THEME.border};
      }
      
      .debug-pane .tp-sprv_r {
        background: ${THEME.border};
      }
      
      .debug-pane .tp-grlv_g {
        border-color: ${THEME.border};
      }
      
      .debug-pane .tp-colswv_sw {
        border: 1px solid ${THEME.colorSelectorBorder};
      }
    `;
  }

  /**
   * Get or create a folder by name
   */
  addFolder(name, options = {}) {
    if (!this.folders.has(name)) {
      const folder = this.pane.addFolder({
        title: name,
        expanded: options.expanded || false,
      });
      this.folders.set(name, folder);
    }
    return this.folders.get(name);
  }

  /**
   * Add a control binding - auto-detects type based on value
   * Compatible with DebugGUI.add()
   */
  add(targetObject, targetProperty, options = {}, folderName = null) {
    try {
      const target = folderName ? this.addFolder(folderName) : this.pane;
      const value = targetObject[targetProperty];
      const label = options.label || targetProperty;

      // Vector2/Vector3
      if (this._isVector(value)) {
        return this._addVectorBinding(
          target,
          targetObject,
          targetProperty,
          value,
          options,
          label
        );
      }

      // Dropdown/select
      if (options.options) {
        return this._addSelectBinding(
          target,
          targetObject,
          targetProperty,
          options,
          label
        );
      }

      // Colors
      if (this._isColor(value, options)) {
        return this._addColorBinding(
          target,
          targetObject,
          targetProperty,
          options,
          label
        );
      }

      // Booleans
      if (typeof value === 'boolean') {
        return this._addBooleanBinding(
          target,
          targetObject,
          targetProperty,
          options,
          label
        );
      }

      // Numbers
      if (typeof value === 'number') {
        return this._addNumberBinding(
          target,
          targetObject,
          targetProperty,
          options,
          label
        );
      }

      // Strings
      if (typeof value === 'string' && !options.color) {
        return this._addStringBinding(
          target,
          targetObject,
          targetProperty,
          options,
          label
        );
      }

      // Fallback
      return this._addGenericBinding(
        target,
        targetObject,
        targetProperty,
        options,
        label
      );
    } catch (error) {
      console.error(`DebugPane: Failed to add "${targetProperty}"`, error);
      return null;
    }
  }

  _isVector(value) {
    if (!value || typeof value !== 'object') return false;
    if (value instanceof THREE.Vector2 || value instanceof THREE.Vector3)
      return true;
    return 'x' in value && 'y' in value;
  }

  _isColor(value, options) {
    if (options.color) return true;
    if (value instanceof THREE.Color) return true;
    if (typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value))
      return true;
    return false;
  }

  _addVectorBinding(
    target,
    targetObject,
    targetProperty,
    value,
    options,
    label
  ) {
    const vecFolder = target.addFolder({ title: label, expanded: true });
    const axes = ['x', 'y'];
    if ('z' in value) axes.push('z');

    const bindings = [];
    axes.forEach((axis) => {
      const binding = vecFolder.addBinding(value, axis, {
        min: options.min ?? -1,
        max: options.max ?? 1,
        step: options.step ?? 0.01,
        label: axis.toUpperCase(),
      });

      if (typeof options.onChange === 'function') {
        binding.on('change', () => {
          try {
            options.onChange(value);
          } catch (e) {
            console.warn(e);
          }
        });
      }
      bindings.push(binding);
    });

    this.controllers.set(`${targetProperty}_vector`, {
      folder: vecFolder,
      bindings,
    });
    return vecFolder;
  }

  _addSelectBinding(target, targetObject, targetProperty, options, label) {
    let selectOptions = options.options;
    if (Array.isArray(selectOptions)) {
      selectOptions = selectOptions.reduce((acc, opt) => {
        acc[opt] = opt;
        return acc;
      }, {});
    }

    const binding = target.addBinding(targetObject, targetProperty, {
      label,
      options: selectOptions,
    });
    if (typeof options.onChange === 'function') {
      binding.on('change', (ev) => options.onChange(ev.value));
    }
    this.controllers.set(`${targetProperty}_select`, binding);
    return binding;
  }

  _addColorBinding(target, targetObject, targetProperty, options, label) {
    const value = targetObject[targetProperty];

    if (value instanceof THREE.Color) {
      const colorProxy = { color: '#' + value.getHexString() };
      const binding = target.addBinding(colorProxy, 'color', {
        label,
        view: 'color',
      });
      binding.on('change', (ev) => {
        value.set(ev.value);
        if (typeof options.onChange === 'function') options.onChange(value);
      });
      this.controllers.set(`${targetProperty}_color`, binding);
      return binding;
    }

    const binding = target.addBinding(targetObject, targetProperty, {
      label,
      view: 'color',
    });
    if (typeof options.onChange === 'function') {
      binding.on('change', (ev) => options.onChange(ev.value));
    }
    this.controllers.set(`${targetProperty}_color`, binding);
    return binding;
  }

  _addBooleanBinding(target, targetObject, targetProperty, options, label) {
    const binding = target.addBinding(targetObject, targetProperty, { label });
    if (typeof options.onChange === 'function') {
      binding.on('change', (ev) => options.onChange(ev.value));
    }
    this.controllers.set(`${targetProperty}_bool`, binding);
    return binding;
  }

  _addNumberBinding(target, targetObject, targetProperty, options, label) {
    const bindingOptions = { label };
    if (options.min !== undefined) bindingOptions.min = options.min;
    if (options.max !== undefined) bindingOptions.max = options.max;
    if (options.step !== undefined) bindingOptions.step = options.step;

    const binding = target.addBinding(
      targetObject,
      targetProperty,
      bindingOptions
    );
    if (typeof options.onChange === 'function') {
      binding.on('change', (ev) => options.onChange(ev.value));
    }
    this.controllers.set(`${targetProperty}_number`, binding);
    return binding;
  }

  _addStringBinding(target, targetObject, targetProperty, options, label) {
    const binding = target.addBinding(targetObject, targetProperty, { label });
    if (typeof options.onChange === 'function') {
      binding.on('change', (ev) => options.onChange(ev.value));
    }
    this.controllers.set(`${targetProperty}_string`, binding);
    return binding;
  }

  _addGenericBinding(target, targetObject, targetProperty, options, label) {
    const binding = target.addBinding(targetObject, targetProperty, { label });
    if (typeof options.onChange === 'function') {
      binding.on('change', (ev) => options.onChange(ev.value));
    }
    this.controllers.set(`${targetProperty}_generic`, binding);
    return binding;
  }

  /**
   * Add a monitor binding (Tweakpane-specific)
   */
  addMonitor(targetObject, targetProperty, options = {}, folderName = null) {
    try {
      const target = folderName ? this.addFolder(folderName) : this.pane;
      const label = options.label || targetProperty;

      const monitorOptions = { label, readonly: true };
      if (options.graph) {
        monitorOptions.view = 'graph';
        if (options.min !== undefined) monitorOptions.min = options.min;
        if (options.max !== undefined) monitorOptions.max = options.max;
      }
      if (options.interval) monitorOptions.interval = options.interval;
      if (options.rows) monitorOptions.rows = options.rows;

      const monitor = target.addBinding(
        targetObject,
        targetProperty,
        monitorOptions
      );
      this.monitors.set(`${targetProperty}_monitor`, monitor);
      return monitor;
    } catch (error) {
      console.error(
        `DebugPane: Failed to add monitor "${targetProperty}"`,
        error
      );
      return null;
    }
  }

  /**
   * Add a button
   */
  addButton(options, folderName = null) {
    try {
      const target = folderName ? this.addFolder(folderName) : this.pane;
      const button = target.addButton({
        title: options.label || options.title || 'Button',
      });
      if (typeof options.onClick === 'function') {
        button.on('click', options.onClick);
      }
      return button;
    } catch (error) {
      console.error('DebugPane: Failed to add button', error);
      return null;
    }
  }

  /**
   * Add a separator
   */
  addSeparator(folderName = null) {
    const target = folderName ? this.addFolder(folderName) : this.pane;
    return target.addBlade({ view: 'separator' });
  }

  /**
   * Add a 2D point control
   */
  addPoint2D(targetObject, targetProperty, options = {}, folderName = null) {
    try {
      const target = folderName ? this.addFolder(folderName) : this.pane;
      const binding = target.addBinding(targetObject, targetProperty, {
        label: options.label || targetProperty,
        x: {
          min: options.min ?? -1,
          max: options.max ?? 1,
          step: options.step ?? 0.01,
        },
        y: {
          min: options.min ?? -1,
          max: options.max ?? 1,
          step: options.step ?? 0.01,
        },
      });
      if (typeof options.onChange === 'function') {
        binding.on('change', (ev) => options.onChange(ev.value));
      }
      return binding;
    } catch (error) {
      console.error(
        `DebugPane: Failed to add Point2D "${targetProperty}"`,
        error
      );
      return null;
    }
  }

  /**
   * Add tabs
   */
  addTabs(options, folderName = null) {
    try {
      const target = folderName ? this.addFolder(folderName) : this.pane;
      return target.addTab({
        pages: options.pages || [{ title: 'Tab 1' }, { title: 'Tab 2' }],
      });
    } catch (error) {
      console.error('DebugPane: Failed to add tabs', error);
      return null;
    }
  }

  refresh() {
    this.pane.refresh();
  }

  setEnabled(enabled) {
    if (this.pane?.element) {
      this.pane.element.style.display = enabled ? 'block' : 'none';
    }
  }

  toggle() {
    if (this.pane?.element) {
      const isVisible = this.pane.element.style.display !== 'none';
      this.setEnabled(!isVisible);
      return !isVisible;
    }
    return false;
  }

  setExpanded(expanded) {
    if (this.pane) this.pane.expanded = expanded;
  }
  getRawPane() {
    return this.pane;
  }
  getFolder(name) {
    return this.folders.get(name);
  }

  removeFolder(name) {
    const folder = this.folders.get(name);
    if (folder) {
      folder.dispose();
      this.folders.delete(name);
      return true;
    }
    return false;
  }

  exportState() {
    return this.pane.exportState();
  }
  importState(state) {
    this.pane.importState(state);
  }

  static getInstance() {
    if (!DebugPane.instance) DebugPane.instance = new DebugPane();
    return DebugPane.instance;
  }

  static destroy() {
    if (DebugPane.instance) {
      if (DebugPane.instance.pane) DebugPane.instance.pane.dispose();
      if (DebugPane.instance.styleElement)
        DebugPane.instance.styleElement.remove();
      DebugPane.instance.folders.clear();
      DebugPane.instance.controllers.clear();
      DebugPane.instance.monitors.clear();
      DebugPane.instance = null;
    }
  }

  dispose() {
    DebugPane.destroy();
  }
}

/**
 * DebugManager - Factory for selecting between DebugGUI and DebugPane
 */
export class DebugManager {
  static instance = null;

  constructor(options = {}) {
    if (DebugManager.instance) return DebugManager.instance;

    this.engine = options.engine || 'lil-gui';
    this.debugInstance = null;
    DebugManager.instance = this;
    this._initialize(options);
  }

  async _initialize(options) {
    if (this.engine === 'tweakpane') {
      this.debugInstance = new DebugPane({
        title: options.title,
        expanded: options.expanded,
      });
    } else {
      const { default: DebugGUI } = await import('./DebugGUI.class.js');
      this.debugInstance = new DebugGUI();
    }
  }

  getInstance() {
    return this.debugInstance;
  }
  add(...args) {
    return this.debugInstance?.add(...args);
  }
  addFolder(...args) {
    return this.debugInstance?.addFolder(...args);
  }

  addMonitor(...args) {
    if (this.engine === 'tweakpane' && this.debugInstance?.addMonitor) {
      return this.debugInstance.addMonitor(...args);
    }
    console.warn('DebugManager: addMonitor requires Tweakpane engine');
    return null;
  }

  addButton(...args) {
    if (this.engine === 'tweakpane' && this.debugInstance?.addButton) {
      return this.debugInstance.addButton(...args);
    }
    console.warn('DebugManager: addButton requires Tweakpane engine');
    return null;
  }

  setEnabled(enabled) {
    return this.debugInstance?.setEnabled(enabled);
  }
  getEngine() {
    return this.engine;
  }
  isTweakpane() {
    return this.engine === 'tweakpane';
  }
  isLilGui() {
    return this.engine === 'lil-gui';
  }

  static getInstance() {
    if (!DebugManager.instance) DebugManager.instance = new DebugManager();
    return DebugManager.instance;
  }

  static destroy() {
    if (DebugManager.instance) {
      if (DebugManager.instance.engine === 'tweakpane') {
        DebugPane.destroy();
      } else {
        import('./DebugGUI.class.js').then(({ default: DebugGUI }) =>
          DebugGUI.destroy()
        );
      }
      DebugManager.instance = null;
    }
  }
}

export { THEME };

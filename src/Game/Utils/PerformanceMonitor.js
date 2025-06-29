import { ThreePerf } from 'three-perf';
import DebugGUI from './DebugGUI';

export default class PerformanceMonitor {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.debug = DebugGUI.getInstance();

    // Initialize Stats‑GL with memory + GPU tracking
    this.stats = new ThreePerf({
      domElement: document.body,
      renderer: this.renderer,
      showGraph: false,
      memory: true,
      anchorX: 'left',
      anchorY: 'top',
    });

    this.perfFolder = this.debug.addFolder('Performance');

    // Enable toggle control
    this.debug.add(this.stats, 'enabled', { label: 'Enable' }, 'Performance');
    this.debug.add(this.stats, 'visible', { label: 'Visible' }, 'Performance');
    this.debug.add(this.stats, 'showGraph', { label: 'Graph' }, 'Performance');
  }

  beginFrame() {
    if (this.stats.enabled) this.stats.begin();
  }

  endFrame() {
    if (this.stats.enabled) this.stats.end();
  }
}

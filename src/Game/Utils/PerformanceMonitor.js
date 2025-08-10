import { ThreePerf } from 'three-perf';
import DebugGUI from './DebugGUI';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default class PerformanceMonitor {
  constructor(renderer) {
    this.renderer = renderer;
    this.debug = DebugGUI.getInstance();

    this.stats = new ThreePerf({
      domElement: document.body,
      renderer: this.renderer,
      showGraph: false,
      memory: true,
      anchorX: 'left',
      anchorY: 'top',
    });
    this.statsNative = new Stats();
    this.statsNative.dom.style.top = '70px';
    document.body.append(this.statsNative.dom);

    this.debug.addFolder('Performance');
    this.debug.add(this.stats, 'showGraph', { label: 'Graph' }, 'Performance');
  }

  beginFrame() {
    if (this.stats.enabled) this.stats.begin();
  }

  endFrame() {
    if (this.stats.enabled) this.stats.end();
    this.statsNative.update();
  }
}

import EventEmitter from './EventEmitter.class';

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsedTime = 0;
    this.delta = 0;
    this.maxDelta = 0.05;
    this.isPaused = false;
    this.pauseStart = 0;

    window.requestAnimationFrame(() => this.animate());
  }

  animate() {
    const currentTime = Date.now();

    if (!this.isPaused) {
      this.delta = Math.min((currentTime - this.current) / 1000, this.maxDelta);
      this.current = currentTime;
      this.elapsedTime = (this.current - this.start) / 1000;

      this.trigger('animate');
    } else {
      // When paused, set delta to 0 and don't update current time
      this.delta = 0;
    }

    window.requestAnimationFrame(() => this.animate());
  }

  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.pauseStart = Date.now();
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;

    // Adjust start time to account for pause duration
    const pauseDuration = Date.now() - this.pauseStart;
    this.start += pauseDuration;
    this.current = Date.now();
  }
}

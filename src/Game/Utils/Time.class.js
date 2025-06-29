import EventEmitter from './EventEmitter.class';

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsedTime = 0;
    this.delta = 34;

    window.requestAnimationFrame(() => {
      this.animate();
    });
  }

  animate() {
    const currentTime = Date.now();
    this.delta = (currentTime - this.current) / 1000;
    this.current = currentTime;
    this.elapsedTime = (this.current - this.start) / 1000;

    this.trigger('animate');

    window.requestAnimationFrame(() => {
      this.animate();
    });
  }
}

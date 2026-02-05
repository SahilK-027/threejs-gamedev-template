import EventEmitter from '../Utils/EventEmitter.class.js';

export default class VisibilityManager extends EventEmitter {
  constructor() {
    super();

    this.isVisible = true;
    this.isActive = true;

    this.setupHandlers();
  }

  setupHandlers() {
    // Bind all handlers
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handlePageHide = this.handlePageHide.bind(this);

    if (typeof document !== 'undefined') {
      // Primary handler - works in most modern browsers for tab switching
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
      window.addEventListener('pagehide', this.handlePageHide);
    }
  }

  removeHandlers() {
    if (typeof document !== 'undefined') {
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      window.removeEventListener('pagehide', this.handlePageHide);
    }
  }

  handleVisibilityChange() {
    const isHidden = document.hidden;
    this.isVisible = !isHidden;

    if (isHidden) {
      this.isActive = false;
      this.trigger('pause');
    } else {
      this.isActive = true;
      this.trigger('resume');
    }
  }

  handleBeforeUnload() {
    this.isActive = false;
    this.trigger('pause');
    console.log('pause');
  }

  handlePageHide() {
    this.isActive = false;
    this.trigger('pause');
    console.log('pause');
  }

  destroy() {
    this.removeHandlers();
  }
}

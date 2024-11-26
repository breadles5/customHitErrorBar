// Tick pool management
const POOL_SIZE = 200;

class TickPool {
  constructor() {
    this.pool = new Array(POOL_SIZE);
    this.index = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    for (let i = 0; i < POOL_SIZE; i++) {
      const tick = document.createElement("div");
      tick.style.position = "absolute";
      tick.style.willChange = "transform";
      this.pool[i] = tick;
    }
    this.initialized = true;
  }

  get() {
    if (!this.initialized) this.init();

    // Reuse existing tick if available
    for (let i = 0; i < POOL_SIZE; i++) {
      const idx = (this.index + i) % POOL_SIZE;
      if (!this.pool[idx].parentNode) {
        this.index = (idx + 1) % POOL_SIZE;
        return this.pool[idx];
      }
    }

    // If no ticks available, reuse oldest
    const tick = this.pool[this.index];
    if (tick.parentNode) {
      tick.parentNode.removeChild(tick);
    }
    this.index = (this.index + 1) % POOL_SIZE;
    return tick;
  }

  release(tick) {
    // Only remove fade-out and preserve timing window classes until next use
    tick.classList.remove("fade-out");

    // Clear any inline styles
    tick.style.cssText = "";

    // Ensure position and transform are explicitly reset
    tick.style.position = "absolute";
    tick.style.willChange = "transform";

    if (tick.parentNode) {
      tick.parentNode.removeChild(tick);
    }
  }

  reset() {
    for (let i = 0; i < POOL_SIZE; i++) {
      const tick = this.pool[i];
      if (tick && tick.parentNode) {
        tick.parentNode.removeChild(tick);
      }
    }
    this.index = 0;
  }
}

export const tickPool = new TickPool();

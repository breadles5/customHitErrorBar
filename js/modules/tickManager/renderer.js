import { elements } from "../../elements.js";
import { tickPool } from "./pool.js";

// Pre-calculate transform strings
const transformCache = new Map();

export class TickRenderer {
  constructor() {
    this.activeTicks = new Map();
    this.pendingRemovals = [];
    this.lastCleanup = 0;
  }

  getTransformString(position) {
    // Round to fewer decimal places for better cache hits
    const key = Math.round(position);
    let transform = transformCache.get(key);

    if (!transform) {
      transform = `translateX(${key}px)`;
      // Only cache common positions
      if (Math.abs(key) <= 500) {
        // Most hits are within ±500px
        transformCache.set(key, transform);
      }
    }
    return transform;
  }

  setTickPosition(tick, hitError) {
    // Optimize multiplication
    const position = (hitError * 5) >> 1; // Multiply by 2.5 using bitwise ops
    tick.style.transform = this.getTransformString(position);
    return position;
  }

  isInViewport(position) {
    // Use constants for better performance
    const HALF_WIDTH = 570; // (940 + 200) / 2
    return Math.abs(position) <= HALF_WIDTH;
  }

  processPendingRemovals() {
    if (this.pendingRemovals.length === 0) return;

    // Use DocumentFragment for batch DOM operations
    const fragment = document.createDocumentFragment();
    const toRelease = [];

    for (const tick of this.pendingRemovals) {
      if (tick.parentNode === elements.tickContainer) {
        fragment.appendChild(tick);
        toRelease.push(tick);
      }
    }

    // Batch DOM removal
    if (fragment.childNodes.length > 0) {
      requestAnimationFrame(() => {
        // Release ticks in batch
        for (const tick of toRelease) {
          tickPool.release(tick);
        }
      });
    }

    // Clear array efficiently
    this.pendingRemovals.length = 0;
  }

  cleanup() {
    if (this.activeTicks.size === 0) return;

    console.log(
      `[cleanup] Starting full cleanup. Active ticks: ${this.activeTicks.size}`,
    );

    // Batch DOM operations
    const fragment = document.createDocumentFragment();
    for (const tick of this.activeTicks.values()) {
      if (tick?.parentNode) {
        fragment.appendChild(tick);
      }
    }

    // Single DOM operation
    requestAnimationFrame(() => {
      for (const tick of fragment.childNodes) {
        tickPool.release(tick);
      }
    });

    this.activeTicks.clear();
    this.pendingRemovals.length = 0;
    tickPool.reset();
    transformCache.clear();
  }

  cleanupTicks(settings) {
    const now = Date.now();
    if (now - this.lastCleanup < 100) return;
    this.lastCleanup = now;

    const ticksToRemove = [];
    console.log(
      `[cleanupTicks] Starting cleanup check. Active ticks: ${this.activeTicks.size}`,
    );

    for (const [timestamp, tick] of this.activeTicks.entries()) {
      const age = now - timestamp;
      if (age >= settings.tickDuration) {
        console.log(
          `[cleanupTicks] Tick aged out: ${age}ms old (limit: ${settings.tickDuration}ms)`,
        );
        ticksToRemove.push([timestamp, tick]);
        continue;
      }

      if (tick.parentNode === elements.tickContainer) {
        const transform = tick.style.transform;
        const position = transform
          ? parseFloat(transform.match(/-?\d+\.?\d*/)?.[0] || "0")
          : 0;

        if (!this.isInViewport(position)) {
          console.log(
            `[cleanupTicks] Tick out of viewport: position ${position}`,
          );
          ticksToRemove.push([timestamp, tick]);
        }
      }
    }

    if (ticksToRemove.length > 0) {
      console.log(`[cleanupTicks] Removing ${ticksToRemove.length} ticks`);
      for (const [timestamp, tick] of ticksToRemove) {
        // Start fade-out animation
        tick.classList.add("fade-out");
        this.activeTicks.delete(timestamp);

        // Wait for animation to complete before removing
        const removeAfterFadeOut = () => {
          this.pendingRemovals.push(tick);
          if (this.pendingRemovals.length === 1) {
            requestAnimationFrame(() => this.processPendingRemovals());
          }
        };

        // Use transitionend instead of setTimeout for more reliable animation completion
        tick.addEventListener(
          "transitionend",
          () => {
            removeAfterFadeOut();
          },
          { once: true },
        ); // Remove listener after it fires once

        // Fallback timeout in case transition doesn't fire
        setTimeout(removeAfterFadeOut, settings.fadeOutDuration + 100);
      }
    }
  }
}

export const tickRenderer = new TickRenderer();

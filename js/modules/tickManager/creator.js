import { elements } from "../../elements.js";
import { tickPool } from "./pool.js";
import { tickRenderer } from "./renderer.js";
import { getSettings } from "../../settings.js";
import { calculateTimingWindowsForGamemode as calculateTimingWindows } from "../../timingWindows.js";

export class TickCreator {
  constructor() {
    this.timingWindowCache = new Map();
  }

  async createTick(hitError, gamemode, od, mods) {
    // Check if timing windows are cached
    const cacheKey = `${gamemode}-${od}-${mods}`;
    let timingWindows = this.timingWindowCache.get(cacheKey);

    if (!timingWindows) {
      timingWindows = await this.calculateTimingWindowsForGamemode(
        gamemode,
        od,
        mods,
      );
      this.timingWindowCache.set(cacheKey, timingWindows);
    }

    // Calculate position
    const position = hitError * 2.5;

    // Only create tick if in viewport
    if (!tickRenderer.isInViewport(position)) {
      return null;
    }

    // Get tick element and calculate color
    const hitErrorAbs = Math.abs(hitError);
    const tick = tickPool.get();

    // Set position directly
    tickRenderer.setTickPosition(tick, hitError);

    // More efficient class handling - use className for bulk removal
    tick.className = "tick"; // Single operation to clear and set base class

    // Add accuracy class based on timing windows and gamemode - use direct string comparison
    if (gamemode === "mania") {
      if (hitErrorAbs <= timingWindows["300g"]) {
        tick.className = "tick marvelous";
      } else if (hitErrorAbs <= timingWindows[300]) {
        tick.className = "tick perfect";
      } else if (hitErrorAbs <= timingWindows[200]) {
        tick.className = "tick great";
      } else if (hitErrorAbs <= timingWindows[100]) {
        tick.className = "tick good";
      } else if (hitErrorAbs <= timingWindows[50]) {
        tick.className = "tick bad";
      } else {
        tick.className = "tick miss";
      }
    } else {
      // Standard, Taiko, Fruits
      if (hitErrorAbs <= timingWindows[300]) {
        tick.className = "tick perfect";
      } else if (hitErrorAbs <= timingWindows[100]) {
        tick.className = "tick good";
      } else if (hitErrorAbs <= timingWindows[50]) {
        tick.className = "tick bad";
      } else {
        tick.className = "tick miss";
      }
    }

    // Add to container and track
    if (elements.tickContainer) {
      elements.tickContainer.appendChild(tick);
      tickRenderer.activeTicks.set(Date.now(), tick);

      // Run cleanup
      tickRenderer.cleanupTicks(getSettings());
    }

    return tick;
  }

  clearCache() {
    this.timingWindowCache.clear();
  }
  async calculateTimingWindowsForGamemode(gamemode, od, mods) {
    return await calculateTimingWindows(gamemode, od, mods);
  }
}

export const tickCreator = new TickCreator();

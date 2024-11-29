import WebSocketManager from "./socket.js";
import { updateSettings } from "./settings.js";
import { elements } from "./elements.js";
import { tickCreator, tickRenderer } from "./modules/tickManager/index.js";
import { getArrowColor } from "./elements.js";
import { updateTimingWindows } from "./timingWindows.js";

const DEFAULT_HOST = "127.0.0.1:24050";
let wsManager = new WebSocketManager(DEFAULT_HOST);
let currentHost = DEFAULT_HOST;
let state = 0;
let mode = "";
let od = 0;
let mods = [];

// Store timeouts for cleanup
const timeouts = [];

// Track local hit error history
let lastHitErrorCount = 0;

// Initialize calculation worker
let calculationWorker;
try {
  calculationWorker = new Worker(
    new URL("./calculationWorker.js", import.meta.url),
    {
      type: "module",
    },
  );
} catch (err) {
  calculationWorker = new Worker("./js/calculationWorker.js");
  console.error("Failed to load worker as module:", err);
}

// Handle worker messages
calculationWorker.onmessage = (e) => {
  const { type, data } = e.data;
  if (type === "statistics") {
    const { average, standardDeviation } = data;

    // Update UI with calculated values
    requestAnimationFrame(() => {
      if (elements.sd) {
        elements.sd.textContent = standardDeviation.toFixed(2);
      }

      const arrowColor = getArrowColor(average);
      updateArrowPosition(average * 2.5, arrowColor);
    });
  }
};

// Animation functions
function updateArrowPosition(targetPosition, targetColor) {
  if (elements.arrow) {
    elements.arrow.style.transform = `translateX(${targetPosition}px)`;
    elements.arrow.style.borderTopColor = targetColor;
  }
}

// Cleanup function
const cleanup = () => {
  // Reset all timeouts
  while (timeouts.length > 0) {
    clearTimeout(timeouts.pop());
  }
};

// Reset function
const reset = () => {
  cleanup();

  // Reset worker
  calculationWorker.postMessage({ type: "reset" });

  // Reset hit error count
  lastHitErrorCount = 0;

  // Clean up ticks and clear caches
  tickRenderer.cleanup();
  tickCreator.clearCache(); // Clear timing window cache on reset

  // Reset UI
  if (elements.sd) {
    elements.sd.textContent = "0.00";
  }
  updateArrowPosition(0, getArrowColor(0));
};

// Initialize WebSocket connection
wsManager.sendCommand("getSettings", encodeURI(window.COUNTER_PATH));

wsManager.commands((data) => {
  try {
    const { command, message } = data;
    console.log(
      "[WEBSOCKET] Received command:",
      command,
      "with data:",
      message,
    );

    if (command === "getSettings") {
      if (message.error) {
        console.error("[SETTINGS] Error:", message.error);
        return;
      }

      const newHost = message?.websocketUrl;
      if (newHost && newHost !== currentHost) {
        currentHost = newHost;
        wsManager.close();
        wsManager = new WebSocketManager(currentHost);
      }

      // Update settings with received values
      updateSettings(message);
    } else if (command === "updateSettings") {
      updateSettings(message);
      // Clear timing window cache when settings change
      tickCreator.clearCache();
    }
  } catch (error) {
    console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
  }
});

// Handle game state and menu updates
wsManager.api_v2((data) => {
  try {
    // Update state visibility
    const newState = data.state.number;
    if (state !== newState) {
      console.log(`[GameState] State changed from ${state} to ${newState}`);
      state = newState;

      // Show elements during playing (2)
      if (state === 2) {
        requestAnimationFrame(() => {
          elements.allDivs?.forEach((div) => div.classList.remove("hidden"));
          // Initialize timing windows when entering gameplay
          updateTimingWindows(mode, od, mods);
        });
      } else {
        // Fade out elements when leaving gameplay
        elements.allDivs?.forEach((div) => {
          div.classList.add("hidden");
        });
        // Always reset when leaving state 2
        console.log("[GameState] Leaving play state, resetting...");
        // Wait for fade out to complete before resetting
        setTimeout(() => {
          reset();
        }, 200); // Match the CSS transition duration
      }
    }

    // Update gamemode and OD
    const modeChanged = mode !== data.beatmap.mode.name;
    const odChanged = od !== data.beatmap.stats.od.original;
    const modsChanged = mods !== data.play.mods.name;

    if (modeChanged || odChanged || modsChanged) {
      mode = data.beatmap.mode.name;
      od = data.beatmap.stats.od.original;
      mods = data.play.mods.name;
      // Update timing windows when parameters change
      if (state === 2) {
        updateTimingWindows(mode, od, mods);
      }
      // Clear timing window cache when parameters change
      tickCreator.clearCache();
    }
  } catch (error) {
    console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
  }
});

// Handle hit error updates
wsManager.api_v2_precise(async (data) => {
  try {
    const hits = data.hitErrors ?? [];

    // Only process new hit errors
    if (hits.length > lastHitErrorCount) {
      // Get all new hits
      const newHits = hits.slice(lastHitErrorCount);
      lastHitErrorCount = hits.length;
      if (newHits.length === 0) {
        cleanup();
      }
      // Process new hits
      for (const hit of newHits) {
        // Create tick and wait for timing windows
        await tickCreator.createTick(hit, mode, od, mods);

        // Send hit to worker for calculation
        calculationWorker.postMessage({
          type: "addHitError",
          data: hit,
        });
      }
    }
  } catch (error) {
    console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
  }
});

// Cleanup on page unload
window.addEventListener("unload", () => {
  cleanup();
  tickRenderer.cleanup();
});

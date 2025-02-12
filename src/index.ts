import WebSocketManager from "./sockets/socket.js";
import type { Settings, Tick, WEBSOCKET_V2, WEBSOCKET_V2_PRECISE } from "./sockets/types.ts";
import { settings, updateSettings } from "./utils/settings.js";
import { clearSD, elements, updateTimingWindowElements, setHidden, setVisible } from "./utils/elements.ts";
import { calculateModTimingWindows } from "./utils/timingWindows.ts";
import { renderTicks, clearTicks } from "./utils/ticks.ts";
import { resetArrow, updateArrow } from "./utils/arrow.ts";

interface WebSocketCommandMessage extends Partial<Settings> {
    error?: string;
    websocketUrl?: string;
}

interface CommandData {
    command: string;
    message: WebSocketCommandMessage;
}

const DEFAULT_HOST = "127.0.0.1:24050";
let wsManager = new WebSocketManager(DEFAULT_HOST);
let currentHost = DEFAULT_HOST;
// initialize workers
const ticksWorker = new Worker(new URL("./workers/ticks/ticksWorker", import.meta.url), { type: "module" });
const statisticsWorker = new Worker(new URL("./workers/statistics/statisticsWorker", import.meta.url), {
    type: "module",
});

interface cache {
    mode: string;
    mods: string;
    od: number;
    state: string;
    statistics: Record<string, number>;
    timingWindows: Record<string, number>;
    tickPool: Tick[];
    isReset: boolean; // for state check
    isUIreset: boolean; // for hit error array check
}
export const cache = {
    mode: "",
    mods: "", // mod names concatenated as string
    od: 0,
    state: "",
    statistics: {
        averageError: 0,
        standardDeviationError: 0,
    },
    timingWindows: {},
    tickPool: [],
    isReset: true,
    isUIreset: true,
};

// Reset UI
const resetUI = () => {
    clearSD();
    resetArrow();
    clearTicks();
    console.log("[Main] reset UI");
};

// extends resetUI to reset everything
const reset = () => {
    resetUI();
    cache.tickPool = [];
    cache.statistics = { averageError: 0, standardDeviationError: 0 };
    ticksWorker.postMessage({ type: "reset" });
    statisticsWorker.postMessage({ type: "reset" });
    console.log("[Main] reset");
};

// Initialize WebSocket connection
wsManager.sendCommand("getSettings", encodeURI(window.COUNTER_PATH as string));

wsManager.commands((data: CommandData) => {
    try {
        const { command, message } = data;
        console.log("[WEBSOCKET] Received command:", command, "with data:", message);

        if (command === "getSettings") {
            if (message.error) {
                console.error("[SETTINGS] Error:", message.error);
                return;
            }

            const newHost = message?.websocketUrl;
            if (newHost && newHost !== currentHost) {
                currentHost = newHost;
                wsManager.close(currentHost);
                wsManager = new WebSocketManager(currentHost);
            }
            // Update settings with received values
            updateSettings(message);
        } else if (command === "updateSettings") {
            updateSettings(message);
        }
    } catch (error) {
        console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
    }
});

// Handle game state and menu updates
wsManager.api_v2((data: WEBSOCKET_V2) => {
    try {
        // Update state visibility
        if (cache.state !== data.state.name) {
            // reminder: following is executed only on state change
            console.log(`[GameState] State change: ${cache.state} to: ${data.state.name}`);
            cache.state = data.state.name;

            // Show elements during playing
            if (cache.state === "play") {
                setVisible();
                updateTimingWindowElements();
                cache.isReset = false;
                cache.isUIreset = false;
                ticksWorker.postMessage({ type: "init", data: cache.timingWindows });
                statisticsWorker.postMessage({ type: "init" });
            } else {
                // Fade out elements when leaving gameplay
                setHidden();
                // Wait for fade out to complete before resettingW
                setTimeout(() => {
                    reset();
                }, settings.fadeOutDuration);
                cache.isReset = true;
                cache.isUIreset = true;
            }
        }

        // Update gamemode and OD
        const modeChanged: boolean = cache.mode !== data.play.mode.name;
        const odChanged: boolean = cache.od !== data.beatmap.stats.od.original;
        const modsChanged: boolean = cache.mods !== data.play.mods.name;

        if (modeChanged || odChanged || modsChanged) {
            cache.mode = data.play.mode.name;
            cache.od = data.beatmap.stats.od.original;
            cache.mods = data.play.mods.name;
            cache.timingWindows = calculateModTimingWindows(cache.mode, cache.od, cache.mods);
            // Update timing windows when parameters change
            console.log("[Main] recalculated timing windows");
        }
    } catch (error) {
        console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
    }
});

// Handle hit error updates
wsManager.api_v2_precise((data: WEBSOCKET_V2_PRECISE) => {
    try {
        const hits = data.hitErrors ?? [];

        if (hits.length === 0) {
            // fixes UI retention upon restarting the map
            if (!cache.isUIreset) {
                resetUI();
                cache.isUIreset = true; // prevents resetting the UI on the next callback
            }
        } else {
            if (cache.state === "play") {
                ticksWorker.postMessage({ type: "update", data: hits });
                statisticsWorker.postMessage({ type: "update", data: cache.tickPool });
                // recieve tick pool and statistics from workers
                // not comparing the received data to the cache since comparison is done in the worker to determine if message should be sent to main thread
                ticksWorker.onmessage = (event) => {
                    cache.tickPool = event.data;
                    renderTicks(cache.tickPool);
                };
                statisticsWorker.onmessage = (event) => {
                    cache.statistics = event.data;
                    updateArrow(cache.statistics.averageError);
                    if (elements.sd) {
                        elements.sd.textContent = cache.statistics.standardDeviationError.toFixed(2);
                    }
                };
            }
            if (cache.isUIreset) {
                cache.isUIreset = false;
            }
        }
    } catch (error) {
        console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
    }
});

// Cleanup on page unload
window.addEventListener("unload", () => {
    reset();
    ticksWorker.terminate();
    statisticsWorker.terminate();
    console.log("[PAGE_UNLOAD] Workers terminated");
});

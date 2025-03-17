import WebSocketManager from "./sockets/socket";
import type { Settings, WEBSOCKET_V2, WEBSOCKET_V2_PRECISE } from "./sockets/types";
import { settings, updateSettings, getSettings } from "./utils/settings";
import {
    clearSD,
    updateTimingWindowElements,
    setHidden,
    setVisible,
    elementCache,
    getAllElements,
} from "./utils/elements";
import { calculateModTimingWindows } from "./utils/timingWindows";
import { renderTicksOnLoad, rerenderTicks } from "./utils/ticks";
import { resetArrow, updateArrow } from "./utils/arrow";
import { TickPool } from "./workers/shared/tickPool";

window?.addEventListener("load", renderTicksOnLoad);
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
    statistics: Record<PropertyKey, number>;
    timingWindows: Map<PropertyKey, number>;
    tickPool: TickPool;
    isReset: boolean; // for state check
    isUIreset: boolean; // for hit error array check
}
// no need to convert to map, since keys are already known at compile/runtime.
export const cache: cache = {
    mode: "",
    mods: "", // mod names concatenated as string
    od: 0,
    state: "",
    statistics: {
        averageError: 0,
        standardDeviationError: 0,
    }, // keys are always known at compile/runtime, so its ok to leave this as on object
    timingWindows: new Map<string, number>(), // same can't be said here, since mania has 5 timing windows, while all taiko and standard have 3
    tickPool: new TickPool(),
    isReset: true,
    isUIreset: true,
};
// Reset UI
const resetUI = () => {
    clearSD();
    resetArrow();
    rerenderTicks();
    console.log("[Main] reset UI");
};
// extends resetUI to reset everything
const reset = () => {
    resetUI();
    cache.tickPool.set();
    cache.statistics.averageError = 0;
    cache.statistics.standardDeviationError = 0;
    
    // synchronizes worker caches
    ticksWorker.postMessage({ type: "set" });
    statisticsWorker.postMessage({ type: "set" });
    console.log("[Main] reset");
};
// Initialize WebSocket connection
wsManager.sendCommand("getSettings", encodeURI(<string>window.COUNTER_PATH));

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
        if (cache.state !== data.state.name) {
            console.log(`[GameState] State change: ${cache.state} to: ${data.state.name}`);
            cache.state = data.state.name;
            
            const modeChanged: boolean = cache.mode !== data.play.mode.name;
            const odChanged: boolean = cache.od !== data.beatmap.stats.od.original;
            const modsChanged: boolean = cache.mods !== data.play.mods.name;

            if (modeChanged || odChanged || modsChanged) {
                cache.mode = data.beatmap.mode.name;
                cache.od = data.beatmap.stats.od.original;
                cache.mods = data.play.mods.name;
            }
            
            if (cache.state === "play") {
                setVisible();
                updateTimingWindowElements();
                cache.timingWindows = calculateModTimingWindows(cache.mode, cache.od, cache.mods);
                cache.isReset = false;
                cache.isUIreset = false;
                ticksWorker.postMessage({ 
                    type: "set", 
                    data: {
                        timingWindows: cache.timingWindows, 
                        settings: getSettings()
                    } 
                });
                statisticsWorker.postMessage({ type: "set" });
            } else {
                setHidden();
                setTimeout(() => {
                    reset();
                    cache.isReset = true;
                    cache.isUIreset = true;
                }, settings.fadeOutDuration);
            }

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
            if (!cache.isUIreset) {
                resetUI();
                cache.isUIreset = true;
            }
        } else {
            ticksWorker.postMessage({ type: "update", data: hits });
            statisticsWorker.postMessage({ type: "update", data: cache.tickPool.pool });
            if (cache.isUIreset) {
                cache.isUIreset = false;
            }
        }
    } catch (error) {
        console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
    }
});

ticksWorker.onmessage = (event) => {
    const divs = getAllElements("div");
    if (divs) {
        elementCache.set("divs", divs);
    }
    cache.tickPool.pool = event.data;
    rerenderTicks();
};
statisticsWorker.onmessage = (event) => {
    cache.statistics = <Record<PropertyKey, number>>event.data;
    const averageError = cache.statistics.averageError;
    updateArrow(averageError);
    if (elementCache.has("sd")) {
        const sdElement = <HTMLElement>elementCache.get("sd");
        sdElement.innerHTML = cache.statistics.standardDeviationError.toFixed(2);
    }
};

// Cleanup on page unload
window.addEventListener("unload", () => {
    reset();
    ticksWorker.terminate();
    statisticsWorker.terminate();
    console.log("[PAGE_UNLOAD] Workers terminated");
});

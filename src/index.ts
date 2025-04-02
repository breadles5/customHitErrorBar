
import WebSocketManager from "./sockets/socket";
import type { CommandData, WEBSOCKET_V2, WEBSOCKET_V2_PRECISE } from "./sockets/types";
import { settings, updateSettings, getSettings } from "./sockets/settings";
import {
    updateTimingWindowElements,
    setHidden,
    setVisible,
    elementCache,
    getAllElements,
    getElement,
} from "./rendering/elements";
import { calculateModTimingWindows } from "./calculation/timingWindows";
import { renderTicksOnLoad, updateTicks } from "./rendering/ticks";
import { updateArrow } from "./rendering/arrow";
import { TickPool } from "./calculation/tickPool";
import { reset } from "./rendering/reset";
import { median, standardDeviation } from "./calculation/statistics";

window?.addEventListener("load", renderTicksOnLoad);

interface cache {
    mode: string;
    mods: string;
    od: number;
    state: string;
    timingWindows: Map<PropertyKey, number>;
    tickPool: TickPool;
    firstObjectTime: number;
    isReset: boolean; // for state check
}
// no need to convert to map, since keys are already known at compile/runtime.
export const cache: cache = {
    mode: "",
    mods: "", // mod names concatenated as string
    od: 0,
    state: "",
    timingWindows: new Map<string, number>(), // same can't be said here, since mania has 5 timing windows, while all taiko and standard have 3
    tickPool: new TickPool(),
    firstObjectTime: 0,
    isReset: true,
};

// Tosu WebSocket connection
const DEFAULT_HOST = window.location.host;
let wsManager = new WebSocketManager(DEFAULT_HOST);
let currentHost = DEFAULT_HOST;
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
        // this is still needed for debugging
        console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
    }
});

// Handle game state and menu updates
const apiV2Filters = ["state", "play", "beatmap"];
wsManager.api_v2((data: WEBSOCKET_V2) => {
    if (cache.state !== data.state.name) {
        cache.state = data.state.name;

        if (cache.state === "play") {
            const modeChanged: boolean = cache.mode !== data.play.mode.name;
            const odChanged: boolean = cache.od !== data.beatmap.stats.od.original;
            const modsChanged: boolean = cache.mods !== data.play.mods.name;

            if (modeChanged || odChanged || modsChanged) {
                cache.mode = data.beatmap.mode.name;
                cache.od = data.beatmap.stats.od.original;
                cache.mods = data.play.mods.name;
            }

            cache.firstObjectTime = data.beatmap.time.firstObject;
            cache.timingWindows = calculateModTimingWindows(cache.mode, cache.od, cache.mods);
            updateTimingWindowElements();
            setVisible();
            cache.isReset = false;
        } else {
            setHidden();
            setTimeout(() => {
                reset();
                cache.isReset = true;
            }, settings.fadeOutDuration);
        }
    }
}, apiV2Filters);

// Handle hit error updates
const apiV2PreciseFilter = ["hitErrors", "currentTime"];
wsManager.api_v2_precise((data: WEBSOCKET_V2_PRECISE) => {
    const { hitErrors, currentTime } = data;

    if (currentTime < cache.firstObjectTime) {
        if (!cache.isReset) {
            reset();
            cache.isReset = true;
        }
    } else {
        cache.tickPool.update(hitErrors);
        
        // should help reduce updateTicks calls during map breaks
        if (cache.tickPool.activeTicks.size > 0) {
            updateTicks();
        }

        const activeErrors: number[] = [];
        for (const idx of cache.tickPool.activeTicks) {
            activeErrors.push(cache.tickPool.pool[idx].position >> 1);
        }
        const medianError = median(activeErrors);
        updateArrow(medianError);
        if (settings.showSD) {
            const standardDeviationError = standardDeviation(activeErrors);
            const sdElement = getElement(".sd");
            if (sdElement) {
                sdElement.innerText = standardDeviationError.toFixed(2);
            }
        }
        if (cache.isReset) {
            cache.isReset = false;
        }
    }
}, apiV2PreciseFilter);

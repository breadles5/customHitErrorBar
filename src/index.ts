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
import { standardDeviation } from "./calculation/statistics";

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
const DEFAULT_HOST = "127.0.0.1:24050";
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
wsManager.api_v2((data: WEBSOCKET_V2) => {
    if (cache.state !== data.state.name) {
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
            cache.firstObjectTime = data.beatmap.time.firstObject;
            cache.timingWindows = calculateModTimingWindows(cache.mode, cache.od, cache.mods);
            updateTimingWindowElements();
            setVisible();
            cache.isReset = false;
            cache.isReset = false;
        } else {
            setHidden();
            setTimeout(() => {
                reset();
                cache.isReset = true;
            }, settings.fadeOutDuration);
        }
    }
});

// Handle hit error updates
wsManager.api_v2_precise((data: WEBSOCKET_V2_PRECISE) => {
    const hits = data.hitErrors ?? [];
    // currentTime is guaranteed to change on each response, so no point in caching it
    const currentTime = data.currentTime;

    if (currentTime < cache.firstObjectTime) {
        if (!cache.isReset) {
            reset();
            cache.isReset = true;
        }
    } else {
        cache.tickPool.update(hits);
        updateTicks();

        const activeTicks = cache.tickPool.pool.filter((tick) => tick.active);
        const errors: number[] = activeTicks.map((tick) => tick.position >> 1);
        const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;
        updateArrow(averageError);

        if (settings.showSD) {
            const standardDeviationError = standardDeviation(errors);
            const sdElement = getElement(".sd");
            if (sdElement) {
                sdElement.innerText = standardDeviationError.toFixed(2);
            }
        }
        if (cache.isReset) {
            cache.isReset = false;
        }
    }
});

// Cleanup on page unload
window.addEventListener("unload", () => {
    reset();
    console.log("[PAGE_UNLOAD] Workers terminated");
});

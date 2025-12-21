import WebSocketManager from "./sockets/socket";
import type { CommandData, WEBSOCKET_V2, WEBSOCKET_V2_PRECISE } from "./sockets/types";
import { settings, updateSettings, getSettings } from "./sockets/settings";
import { updateTimingWindowElements, setHidden, setVisible, getElement } from "./rendering/elements";
import { calculateTimingWindows } from "./calculation/timingWindows";
import { renderTicksOnLoad } from "./rendering/ticks"; // Removed updateTicks
import { updateArrow } from "./rendering/arrow";
import { TickManager } from "./calculation/tickManager";
import { reset } from "./rendering/reset";
import { median } from "./calculation/statistics";

// useful for debugging in browser
if (window.self === window.top) {
    document.body.style.backgroundColor = "black";
}

window?.addEventListener("load", renderTicksOnLoad);

interface cache {
    mode: string;
    mods: string;
    od: number;
    rate: number;
    state: string;
    timingWindows: Map<PropertyKey, number>;
    tickPool: TickManager;
    firstObjectTime: number;
    isReset: boolean; // for state check
}
// no need to convert to map, since keys are already known at compile/runtime.
export const cache: cache = {
    mode: "",
    mods: "", // mod names concatenated as string
    od: 0,
    rate: 0,
    state: "",
    timingWindows: new Map<string, number>(), // same can't be said here, since mania has 5 timing windows, while all taiko and standard have 3
    tickPool: new TickManager(),
    firstObjectTime: 0,
    isReset: true,
};

// Tosu WebSocket connection
const DEFAULT_HOST = window.location.host;
const wsManager = new WebSocketManager(DEFAULT_HOST);
const SETTINGS_LOG_PREFIX = "[SETTINGS]";
// Initialize WebSocket connection

console.log(`${SETTINGS_LOG_PREFIX} Requesting settings for path`, window?.COUNTER_PATH);
wsManager.sendCommand("getSettings", encodeURI(<string>window.COUNTER_PATH));
wsManager.commands((data: CommandData) => {
    try {
        const { command, message } = data;
        console.log("[WEBSOCKET] Received command:", command, "with data:", message);

        if (command === "getSettings") {
            console.log(`${SETTINGS_LOG_PREFIX} Received settings payload`);
            updateSettings(message);
        }
    } catch (error) {
        // this is still needed for debugging
        console.error("[MESSAGE_ERROR] Error processing WebSocket message:", error);
    }
});



// Handle game state and menu updates
const apiV2Filters = [
    { field: "state", keys: ["name"] },
    {
        field: "play",
        keys: [
            { field: "mode", keys: ["name"] },
            { field: "mods", keys: ["name", "rate"] },
        ],
    },
    {
        field: "beatmap",
        keys: [
            { field: "mode", keys: ["name"] },
            { field: "stats", keys: [{ field: "od", keys: ["original"] }] },
            { field: "time", keys: ["firstObject"] },
        ],
    },
];
wsManager.api_v2((data: WEBSOCKET_V2) => {
    if (cache.state !== data.state.name) {
        cache.state = data.state.name;

        const modeChanged: boolean = cache.mode !== data.play.mode.name;
        const odChanged: boolean = cache.od !== data.beatmap.stats.od.original;
        const modsChanged: boolean = cache.mods !== data.play.mods.name;
        cache.rate = data.play.mods.rate;

        if (cache.state === "play") {

            if (modeChanged || odChanged || modsChanged) {
                cache.mode = data.beatmap.mode.name;
                cache.od = data.beatmap.stats.od.original;
                cache.mods = data.play.mods.name;
            }

            cache.firstObjectTime = data.beatmap.time.firstObject;
            const custom = settings.useCustomTimingWindows ? settings.customTimingWindows : undefined;
            cache.timingWindows = calculateTimingWindows(cache.mode, cache.od, cache.mods, custom);
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
// Reusable buffer to avoid allocations per frame
const nonFadeOutErrors: number[] = [];

wsManager.api_v2_precise((data: WEBSOCKET_V2_PRECISE) => {
    const { hitErrors, currentTime } = data;
    if (currentTime < cache.firstObjectTime) {
        if (!cache.isReset) {
            reset();
            cache.isReset = true;
        }
    } else {
        cache.tickPool.update(hitErrors);

        // Clear buffer without allocation
        nonFadeOutErrors.length = 0;

        for (const idx of cache.tickPool.nonFadeOutTicks) {
            nonFadeOutErrors.push(cache.tickPool.pool[idx].position >> 1);
        }

        const medianError = median(nonFadeOutErrors);
        updateArrow(medianError);
        if (cache.isReset) {
            cache.isReset = false;
        }
    }
}, apiV2PreciseFilter);

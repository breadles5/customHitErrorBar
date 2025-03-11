import { TickPool, tickPoolCache, setSettings } from "../shared/tickPool";

const tickPool = new TickPool();

self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update":
            tickPool.update(data);
            if (tickPoolCache.localHitErrors !== data) {
                tickPoolCache.localHitErrors = data;
                postMessage(tickPool.pool);
            }
            break;
        case "set": {
            const { timingWindows, settings } = data ?? { timingWindows: new Map<PropertyKey, number>(), settings: {} };
            setSettings(settings);
            tickPool.set();
            tickPoolCache.localHitErrors = [];
            tickPoolCache.timingWindows = timingWindows;
            tickPoolCache.processedHits = 0;
            tickPoolCache.timedOutHits = 0;
            console.log("[Tick Worker] tickPool reset");
            break;
        }
        default:
            console.error("[Tick Worker] unknown message type:", type);
    }
};

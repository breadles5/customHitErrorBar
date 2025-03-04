import { TickPool } from "./tickPool.ts";

const tickPool = new TickPool();

interface TickPoolCache {
    localHitErrors: number[];
    timingWindows: Map<PropertyKey, number>;
    timedOutHits: number;
    processedHits: number;
}
export let tickPoolCache: TickPoolCache = {
    localHitErrors: [],
    timingWindows: new Map<PropertyKey, number>(),
    timedOutHits: 0,
    processedHits: 0,
};

self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update":
            // data is the hit errors array directly
            tickPool.update(data);
            if (tickPoolCache.localHitErrors !== data) {
                tickPoolCache.localHitErrors = data;
                postMessage(tickPool.pool);
            }
            break;
        case "set":
            // on map end, timing windows remain the same, as they are not sent to the worker,
            // on map start, timing windows are sent to the worker. to be updated
            const timingWindows = data ?? new Map<PropertyKey, number>();
            tickPool.set();
            tickPoolCache = {
                localHitErrors: [],
                timingWindows: timingWindows,
                timedOutHits: 0,
                processedHits: 0,
            };
            console.log("[Tick Worker] tickPool reset");
            break;
        default:
            console.error("[Tick Worker] unknown message type:", type);
    }
};

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
        case "init":
            tickPool.set();
            // only timing windows are being sent to the worker
            tickPoolCache.timingWindows = data;
            console.log("[Tick Worker] tickPool initialized");
            break;
        case "reset":
            if (tickPool) {
                tickPool.set();
            }
            tickPoolCache = {
                localHitErrors: [],
                timingWindows: new Map<PropertyKey, number>(),
                timedOutHits: 0,
                processedHits: 0,
            };
            console.log("[Tick Worker] tickPool reset");
            break;
    }
};

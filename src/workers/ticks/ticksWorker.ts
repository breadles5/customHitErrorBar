import { TickPool } from "./tickPool.ts";

let tickPool: TickPool | null = null;

interface TickPoolCache {
    localHitErrors: number[];
    timingWindows: Record<string, number>;
    timedOutHits: number;
    processedHits: number;
}
export let tickPoolCache: TickPoolCache = {
    localHitErrors: [],
    timingWindows: {},
    timedOutHits: 0,
    processedHits: 0,
};

self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update":
            if (tickPool) {
                tickPool.update(data.hitErrors); // continues updating the pool, but only posts the updated pool
                if (tickPoolCache.localHitErrors !== data.hitErrors) {
                    tickPoolCache.localHitErrors = data.hitErrors;
                    postMessage(tickPool.pool);
                }
                console.log("[Tick Worker] tickPool updated");
            }
            break;
        case "init":
            tickPool = new TickPool();
            tickPool.init();
            // only timing windows are being sent to the worker
            tickPoolCache.timingWindows = data;
            console.log("[Tick Worker] tickPool initialized");
            break;
        case "reset":
            if (tickPool) {
                tickPool.reset();
            }
            tickPoolCache = { localHitErrors: [], timingWindows: {}, timedOutHits: 0, processedHits: 0 };
            console.log("[Tick Worker] tickPool reset");
            break;
    }
};

import type { Tick } from "../ticks/tickPool.ts";
import { average, standardDeviation } from "./helpers.ts";

interface Statistics {
    averageError: number;
    standardDeviationError: number;
}
const statistics: Statistics = {
    averageError: 0,
    standardDeviationError: 0,
};
let localTickPool: Tick[] = [];
self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update":
            // memoize tickPool to prevent recalculating statistics on each update
            if (localTickPool !== data.tickPool) {
                localTickPool = data.tickPool;
                const ticks = data.tickPool.filter((tick: Tick) => tick?.active);
                const errors: number[] = ticks.map((tick: Tick) => tick?.position >> 1);
                statistics.averageError = average(errors);
                statistics.standardDeviationError = standardDeviation(errors);
                console.log("[Statistics Worker] updated statistics");
                postMessage({
                    type: "update",
                    data: { statistics },
                });
            }
            break;
        case "init":
            postMessage({
                type: "update",
                data: { statistics },
            });
            console.log("[Statistics Worker] initialized");
            break;
        case "reset":
            statistics.averageError = 0;
            statistics.standardDeviationError;
            console.log("[Statistics Worker] reset");
            break;
    }
};

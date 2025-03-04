import { TickPool, type Tick } from "../ticks/tickPool.ts";
import { average, standardDeviation } from "./helpers.ts";

const statistics = new Map<string, number>([
    ["averageError", 0],
    ["standardDeviationError", 0],
]);

let localTickPool = new TickPool();
self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update":
            if (localTickPool !== data) {
                localTickPool = data;
                const ticks = data.filter((tick: Tick) => tick?.active);
                const errors: number[] = ticks.map((tick: Tick) => tick?.position >> 1);
                statistics.set("averageError", average(errors));
                statistics.set("standardDeviationError", standardDeviation(errors));
                // console.log("[Statistics Worker] updated statistics");
                // Make sure we're sending the Map correctly
                postMessage(Object.fromEntries(statistics));
            }
            break;
        case "set":
            localTickPool.set();
            statistics.set("averageError", 0);
            statistics.set("standardDeviationError", 0);
            console.log("[Statistics Worker] reset statistics");
            break;
        default:
            console.error("[Statistics Worker] unknown message type:", type);
    }
};

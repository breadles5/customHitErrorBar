import type { Tick } from "../shared/types";
import { average, standardDeviation } from "./helpers";

const statistics: Record<PropertyKey, number> = {
    averageError: 0,
    standardDeviationError: 0,
};

self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update": {
            const ticks = data.filter((tick: Tick) => tick?.active);
            const errors: number[] = ticks.map((tick: Tick) => tick.position >> 1);
            statistics.averageError = average(errors);
            statistics.standardDeviationError = standardDeviation(errors);
            postMessage(statistics);
            break;
        }
        case "set":
            statistics.averageError = 0;
            statistics.standardDeviationError = 0;
            break;
    }
};

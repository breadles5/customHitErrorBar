import type { Tick } from "../shared/types";
import { average, standardDeviation } from "./helpers";

const statistics: Record<PropertyKey, number> = {
    averageError: 0,
    standardDeviationError: 0,
}

self.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
        case "update": {
            const ticks = data.filter((tick: Tick) => tick?.active);
            const errors: number[] = ticks.map((tick: Tick) => tick.position >> 1);
            const classNamesArray = data.map((tick: Tick) => tick.classNames);
            statistics.averageError = average(errors);
            statistics.standardDeviationError = standardDeviation(errors)
            postMessage({data: statistics});
            break;
        }
        case "set":
            statistics.averageError = 0;
            statistics.standardDeviationError = 0;
            break;
    }
};

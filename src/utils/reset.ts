import { cache, ticksWorker, statisticsWorker } from "..";
import { resetArrow } from "./arrow";
import { clearSD } from "./elements";
import { rerenderTicks } from "./ticks";

// extends resetUI to reset everything
export const reset = () => {
    resetUI();
    cache.tickPool.set();
    cache.statistics.averageError = 0;
    cache.statistics.standardDeviationError = 0;

    // synchronizes worker caches
    ticksWorker.postMessage({ type: "set" });
    statisticsWorker.postMessage({ type: "set" });
    console.log("[Main] reset");
}; // Reset UI
export const resetUI = () => {
    clearSD();
    resetArrow();
    rerenderTicks();
    console.log("[Main] reset UI");
};

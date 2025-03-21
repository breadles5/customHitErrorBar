import { cache, ticksWorker} from "..";
import { resetArrow } from "./arrow";
import { clearSD } from "./elements";
import { updateTicks } from "./ticks";

// extends resetUI to reset everything
export const reset = () => {
    resetUI();
    cache.tickPool.set();

    // synchronizes worker caches
    ticksWorker.postMessage({ type: "set" });
    console.log("[Main] reset");
}; // Reset UI
export const resetUI = () => {
    clearSD();
    resetArrow();
    updateTicks();
    console.log("[Main] reset UI");
};

import { cache } from "..";
import { resetArrow } from "./arrow";
import { clearSD } from "./elements";
import { resetTicks, updateTicks } from "./ticks";

// extends resetUI to reset everything
export const reset = () => {
    cache.tickPool.set();
    resetTicks;
    clearSD();
    resetArrow();
    console.log("[Main] reset");
};

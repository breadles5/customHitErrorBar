import { cache } from "..";
import { resetArrow } from "./arrow";
import { resetTicks } from "./ticks";

// extends resetUI to reset everything
export const reset = () => {
    requestAnimationFrame(() => {
        cache.tickPool.set();
        resetTicks();
        resetArrow();
        console.log("[Main] reset");
    });
};

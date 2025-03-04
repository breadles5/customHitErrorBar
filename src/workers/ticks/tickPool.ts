import { tickPoolCache } from "./ticksWorker";
import { settings } from "../../utils/settings";

export class Tick {
    position: number;
    active: boolean;
    fadeout: boolean;
    timestamp: number; // timestamp in milliseconds
    classNames: string;

    constructor() {
        this.position = 0;
        this.active = false;
        this.timestamp = Date.now();
        // initialize class names and fadeout
        this.classNames = "tick";
        this.fadeout = false;
    }
    private setClassNames() {
        const timingWindows = tickPoolCache.timingWindows;
        for (const [grade, range] of Object.entries(timingWindows)) {
            const hitError = Math.abs(this.position >> 1); // this.position will always be a multiple of 2, check setActive method
            this.classNames += hitError <= range ? `tick _${grade}` : "tick _0";
        }
    }
    // set tick to active
    setActive(hitError: number) {
        this.position = hitError << 1;
        this.active = true;
        this.timestamp = Date.now();
        // apply timing window class
        this.setClassNames;
        tickPoolCache.processedHits++;
    }
    setFadeout() {
        this.fadeout = true;
        this.classNames += " fadeout";
    }
    setInactive() {
        this.active = false;
        this.classNames = "tick inactive";
        this.timestamp = 0;
        tickPoolCache.timedOutHits++;
    }
    resetActive(hitError: number) {
        this.position = hitError << 1;
        this.timestamp = Date.now();
        if (this.fadeout) {
            this.fadeout = false;
            this.setClassNames();
        }
        tickPoolCache.timedOutHits++;
        tickPoolCache.processedHits++;
    }
}

const POOL_SIZE = 200;
export class TickPool {
    pool: (Tick)[];
    constructor() {
        this.pool = new Array(POOL_SIZE);
    }
    // initialize and reset pool
    set() {
        for (let i = 0; i < POOL_SIZE; i++) {
            this.pool[i] = new Tick();
        }
    }
    // update pool with hit errors (array)
    update(hitErrors: number[]) {
        // remaining indices (index % POOL_SIZE) in hitErrors are assigned to the pool
        for (let i = tickPoolCache.timedOutHits; i < hitErrors.length; i++) {
            const poolIndex = i % POOL_SIZE;
            const hitError = hitErrors[i];
            const tick = this.pool[poolIndex];
            const processedHitsindex = tickPoolCache.processedHits - 1;
            if (tick?.active) {
                if (Date.now() - tick.timestamp > settings.tickDuration + settings.fadeOutDuration) {
                    tick.setInactive();
                }
                if (Date.now() - tick.timestamp > settings.tickDuration) {
                    tick.setFadeout();
                }
                // reset active tick only if current hit error's index is greater than processed hits count
                // avoids resetting what should be active ticks on each update
                if (i > processedHitsindex) {
                    tick.resetActive(hitError);
                }
            } else {
                tick?.setActive(hitError);
            }
        }
    }
}

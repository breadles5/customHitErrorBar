import type { Tick, TickPoolCache } from "./types";

export const tickPoolCache: TickPoolCache = {
    localHitErrors: [],
    timingWindows: new Map<PropertyKey, number>(),
    timedOutHits: 0,
    processedHits: 0,
};

// Add settings type
interface TickSettings {
    tickDuration: number;
    fadeOutDuration: number;
}

// Add settings variable
let workerSettings: TickSettings = {
    tickDuration: 0,
    fadeOutDuration: 0,
};

// Add setter for settings
export function setSettings(settings: TickSettings) {
    workerSettings = settings;
}

export class TickImpl implements Tick {
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
        // Start with base class
        this.classNames = "tick";

        // Add timing window class if active
        if (this.active) {
            const hitError = Math.abs(this.position >> 1);
            let matched = false;

            for (const [grade, range] of timingWindows) {
                if (hitError <= range) {
                    this.classNames += ` _${String(grade)}`;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                this.classNames += " _0";
            }
        }
    }

    // set tick to active
    setActive(hitError: number) {
        this.position = hitError << 1;
        this.active = true;
        this.timestamp = Date.now();
        // apply timing window class
        this.setClassNames();
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
            this.classNames = this.classNames.replace(" fadeout", "");
        }
        this.setClassNames();
        tickPoolCache.timedOutHits++;
        tickPoolCache.processedHits++;
    }
    reset() {
        this.position = 0;
        this.active = false;
        this.timestamp = Date.now();
        this.classNames = "tick inactive";
        this.fadeout = false;
    }
}

const POOL_SIZE = 200;
export class TickPool {
    pool: TickImpl[];
    constructor() {
        // Initialize with explicit TickImpl instances and sequential IDs
        this.pool = Array.from({ length: POOL_SIZE }, (_, index) => new TickImpl());
    }

    set() {
        // Ensure we're working with TickImpl instances
        for (const tick of this.pool) {
            if (tick instanceof TickImpl) {
                tick.reset();
            } else {
                // Replace invalid entries with new TickImpl instances
                const index = this.pool.indexOf(tick);
                this.pool[index] = new TickImpl();
            }
        }
    }

    update(hitErrors: number[]) {
        for (let i = tickPoolCache.timedOutHits; i < hitErrors.length; i++) {
            const poolIndex = i % POOL_SIZE;
            const error = hitErrors[i];
            const tick = this.pool[poolIndex];

            // Ensure we're working with a valid TickImpl instance
            if (!(tick instanceof TickImpl)) {
                this.pool[poolIndex] = new TickImpl();
                continue;
            }

            const processedHitsindex = tickPoolCache.processedHits - 1;
            if (!tick.active) {
                tick.setActive(error);
            } else {
                // reset active tick only if current hit error's index is greater than processed hits count
                // avoids resetting what should be active ticks on each update
                if (i > processedHitsindex) {
                    tick.resetActive(error);
                }
                if (Date.now() - tick.timestamp > workerSettings.tickDuration) {
                    tick.setFadeout();
                }
                if (Date.now() - tick.timestamp > workerSettings.tickDuration + workerSettings.fadeOutDuration) {
                    tick.setInactive();
                }
            }
        }
    }
}

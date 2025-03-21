import type { Tick, TickSettings, TickPoolCache } from "./types";

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

    // Convert class methods to static methods
    static reset(tick: TickImpl) {
        tick.position = 0;
        tick.active = false;
        tick.timestamp = Date.now();
        tick.classNames = "tick inactive";
        tick.fadeout = false;
    }

    static setActive(tick: TickImpl, hitError: number) {
        tick.position = hitError << 1;
        tick.active = true;
        tick.timestamp = Date.now();
        TickImpl.setClassNames(tick);
        tickPoolCache.processedHits++;
    }

    static setFadeout(tick: TickImpl) {
        tick.fadeout = true;
        tick.classNames += " fadeout";
    }

    static setInactive(tick: TickImpl) {
        tick.active = false;
        tick.classNames = "tick inactive";
        tick.timestamp = 0;
        tickPoolCache.timedOutHits++;
    }

    static resetActive(tick: TickImpl, hitError: number) {
        tick.position = hitError << 1;
        tick.timestamp = Date.now();
        if (tick.fadeout) {
            tick.fadeout = false;
            tick.classNames = tick.classNames.replace(" fadeout", "");
        }
        TickImpl.setClassNames(tick);
        tickPoolCache.timedOutHits++;
        tickPoolCache.processedHits++;
    }

    static setClassNames(tick: TickImpl) {
        const timingWindows = tickPoolCache.timingWindows;
        tick.classNames = "tick";

        // if (tick.active) {
        // }
        const hitError = Math.abs(tick.position >> 1);
        let matched = false;

        for (const [grade, range] of timingWindows) {
            if (hitError <= range) {
                tick.classNames += ` _${String(grade)}`;
                matched = true;
                break;
            }
        }
        if (!matched) {
            tick.classNames += " _0";
        }
    }
}

export class TickPool {
    readonly PoolSize: number;
    pool: TickImpl[];

    constructor() {
        this.PoolSize = 200;
        this.pool = Array.from({ length: this.PoolSize }, () => new TickImpl());
    }

    set() {
        for (const tick of this.pool) {
            TickImpl.reset(tick);
        }
    }

    update(hitErrors: number[]) {
        for (let i = tickPoolCache.timedOutHits; i < hitErrors.length; i++) {
            const poolIndex = i % this.PoolSize;
            const error = hitErrors[i];
            const tick = this.pool[poolIndex];

            const processedHitsindex = tickPoolCache.processedHits - 1;
            if (!tick.active) {
                TickImpl.setActive(tick, error);
            } else {
                if (i > processedHitsindex) {
                    TickImpl.resetActive(tick, error);
                }
                if (Date.now() - tick.timestamp > workerSettings.tickDuration && !tick.fadeout) {
                    TickImpl.setFadeout(tick);
                }
                if (Date.now() - tick.timestamp > workerSettings.tickDuration + workerSettings.fadeOutDuration && tick.active) {
                    TickImpl.setInactive(tick);
                }
            }
        }
    }
}

// Move tickPoolCache after TickPool definition
export const tickPoolCache: TickPoolCache = {
    timingWindows: new Map<PropertyKey, number>(),
    timedOutHits: 0,
    processedHits: 0,
};

import { cache } from "..";
import { settings } from "../sockets/settings";
import type { Tick } from "./types";

export class TickImpl implements Tick {
    position: number;
    classNames: string;
    active: boolean;
    timestamp: number; // timestamp in milliseconds

    constructor() {
        this.position = 0;
        this.classNames = "tick inactive";
        this.active = false;
        this.timestamp = Date.now();
    }

    // Convert class methods to static methods
    static reset(tick: TickImpl) {
        tick.position = 0;
        tick.classNames = "tick inactive";
        tick.active = false;
        tick.timestamp = Date.now();
    }

    static setActive(tick: TickImpl, hitError: number) {
        tick.position = hitError << 1;
        tick.active = true;
        tick.timestamp = Date.now();
        TickImpl.setClassNames(tick);
    }

    static setInactive(tick: TickImpl) {
        tick.active = false;
        tick.classNames = "tick inactive";
        tick.timestamp = 0;
    }

    static resetActive(tick: TickImpl, hitError: number) {
        tick.position = hitError << 1;
        tick.timestamp = Date.now();
        TickImpl.setClassNames(tick);
    }

    static setClassNames(tick: TickImpl) {
        const timingWindows = cache.timingWindows;
        tick.classNames = "tick";

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
    timedOutHits: number;
    processedHits: number;
    pool: TickImpl[];

    constructor() {
        this.PoolSize = 50;
        this.timedOutHits = 0;
        this.processedHits = 0;
        this.pool = Array.from({ length: this.PoolSize }, () => new TickImpl());
    }

    set() {
        for (const tick of this.pool) {
            TickImpl.reset(tick);
        }
    }

    update(hitErrors: number[]) {
        for (let i = this.timedOutHits; i < hitErrors.length; i++) {
            const poolIndex = i % this.PoolSize;
            const error = hitErrors[i];
            const tick = this.pool[poolIndex];

            const processedHitsindex = this.processedHits - 1;
            if (!tick.active) {
                TickImpl.setActive(tick, error);
                this.processedHits++;
            } else {
                if (i > processedHitsindex) {
                    TickImpl.resetActive(tick, error);
                    this.processedHits++;
                    this.timedOutHits++;
                }
                if (Date.now() - tick.timestamp > settings.tickDuration + settings.fadeOutDuration && tick.active) {
                    TickImpl.setInactive(tick);
                    this.timedOutHits++;
                }
            }
        }
    }
}

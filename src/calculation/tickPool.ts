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
        const { timingWindows } = cache;
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
    private processedHits: number;
    readonly pool: TickImpl[]; // readonly doesnt prevent us from modifying the array, only from reassigning it
    readonly activeTicks: Set<number> = new Set(); // Store indices of active ticks'
    readonly nonFadeOutTicks: Set<number> = new Set(); // Store indices of visible ticks

    constructor() {
        // TODO: add a setting for pool size
        this.PoolSize = 100;
        this.processedHits = 0;
        this.pool = Array.from({ length: this.PoolSize }, () => new TickImpl());
    }

    set() {
        for (const tick of this.pool) {
            TickImpl.reset(tick);
        }
        this.activeTicks.clear();
        this.nonFadeOutTicks.clear();
        this.processedHits = 0;
    }

    update(hitErrors: number[]) {
        const now = Date.now();
        const { tickDuration, fadeOutDuration } = settings;
        const timeoutThreshold = tickDuration + fadeOutDuration;

        // cache class properties here
        const poolSize = this.PoolSize;
        const pool = this.pool;
        const activeTicks = this.activeTicks;
        const nonFadeOutTicks = this.nonFadeOutTicks;
        const processedHits = this.processedHits;

        // Check timeouts only for active ticks
        for (const idx of activeTicks) {
            const tick = pool[idx];
            if (now - tick.timestamp > timeoutThreshold) {
                TickImpl.setInactive(tick);
                activeTicks.delete(idx);
            }
        }

        for (const idx of nonFadeOutTicks) {
            const tick = pool[idx];
            if (now - tick.timestamp > tickDuration) {
                nonFadeOutTicks.delete(idx);
            }
        }
        // Process new hits
        // having an `inactiveTicks` set would be useless
        // since we still neeed to access poolIndex AND the hitError of what should be the corresponding error
        // this is also really efficient since we are NOT iterating over the entire hitErrors array

        // WAIT A SECOND WE'RE JUST USING THE PROCESSED HITS FROM THE PREVIOUS UPDATE
        if (processedHits === hitErrors.length) return;
        for (let i = processedHits; i < hitErrors.length; i++) {
            const poolIndex = i % poolSize;
            const error = hitErrors[i];
            const tick = pool[poolIndex];

            // note: processedHits is a constant declaration referencing the value from the previous state
            // we'll just update it class properties and create a new processedHits in memory on the next update() call.
            
            if (!tick.active) {
                TickImpl.setActive(tick, error);
                activeTicks.add(poolIndex);
                nonFadeOutTicks.add(poolIndex);
                this.processedHits++;
            } else {
                const processedHitsindex = processedHits - 1;
                if (i > processedHitsindex) {
                    TickImpl.resetActive(tick, error);
                    this.processedHits++;
                }
            }
        }
    }
}

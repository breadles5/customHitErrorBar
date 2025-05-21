import { cache } from "..";
import { settings } from "../sockets/settings";
import type { Tick } from "./types";

export class TickImpl implements Tick {
    position: number;
    classNames: string;
    active: boolean;
    timestamp: number; // timestamp in milliseconds
    element: HTMLElement | null; // Added element property
    private lastAppliedX: number; // Track last applied X for optimization
    private _currentAnimation: Animation | null = null;

    constructor() {
        this.position = 0;
        this.classNames = "tick inactive";
        this.active = false;
        this.timestamp = Date.now();
        this.element = null; // Initialize element to null
        this.lastAppliedX = Number.NaN; // Use Number.NaN
    }

    // Instance methods
    reset() {
        this._currentAnimation?.cancel();
        if (this.element) {
            this.element.style.opacity = '0'; // Ensure inactive is fully transparent
        }
        this.position = 0;
        this.classNames = "tick inactive";
        this.active = false;
        this.timestamp = Date.now(); 
        this.updateElement();
    }

    setActive(hitError: number) {
        this._currentAnimation?.cancel();
        if (this.element) {
            this.element.style.opacity = String(settings.tickOpacity);
            this.element.style.visibility = 'visible'; // Ensure it's visible before animating
            this._currentAnimation = this.element.animate(
                [
                    { opacity: settings.tickOpacity }, 
                    { opacity: 0 }
                ],
                {
                    duration: settings.fadeOutDuration,
                    delay: settings.tickDuration,
                    easing: 'linear',
                    fill: 'forwards'
                }
            );
        }

        this.position = hitError << 1;
        this.active = true;
        this.timestamp = Date.now();
        this.setClassNames(); // Updates classNames (colors, base class) and calls updateElement
    }

    setInactive() {
        // Only update if it's actually active to avoid unnecessary DOM changes
        if (this.active) {
            this._currentAnimation?.cancel();
            if (this.element) {
                this.element.style.opacity = '0';
                this.element.style.visibility = 'hidden'; // Consistent with .tick.inactive CSS
            }
            this.active = false;
            this.classNames = "tick inactive";
            this.timestamp = 0; // Set timestamp to 0 for inactive
            this.updateElement(); // Applies .inactive class
        }
    }

    resetActive(hitError: number) {
        this._currentAnimation?.cancel();
        if (this.element) {
            this.element.style.opacity = String(settings.tickOpacity);
            this.element.style.visibility = 'visible'; // Ensure it's visible before animating
            this._currentAnimation = this.element.animate(
                [
                    { opacity: settings.tickOpacity }, 
                    { opacity: 0 }
                ],
                {
                    duration: settings.fadeOutDuration,
                    delay: settings.tickDuration,
                    easing: 'linear',
                    fill: 'forwards'
                }
            );
        }

        this.position = hitError << 1;
        this.timestamp = Date.now();
        this.setClassNames(); // Updates classNames (colors, base class) and calls updateElement
    }

    private setClassNames() {
        const { timingWindows } = cache;
        let newClassNames = "tick"; // Start fresh

        const hitError = Math.abs(this.position >> 1);
        let matched = false;

        for (const [grade, range] of timingWindows) {
            if (hitError <= range) {
                newClassNames += ` _${String(grade)}`;
                matched = true;
                break;
            }
        }
        if (!matched) {
            newClassNames += " _0";
        }

        // Only update if classNames actually changed
        if (this.classNames !== newClassNames) {
            this.classNames = newClassNames;
            this.updateElement(); // Update element if class name changes
        } else {
            // If class name didn't change, but position might have (in resetActive),
            // still call updateElement to handle transform.
            this.updateElement();
        }
    }

    // New method to handle DOM updates
    private updateElement() {
        if (!this.element) return; // Do nothing if element isn't set

        // Update class name if needed
        if (this.element.className !== this.classNames) {
            this.element.className = this.classNames;
        }

        // Update transform only if the position has actually changed
        const targetX = this.active ? this.position : 0; // Inactive ticks should be at position 0
        if (targetX !== this.lastAppliedX) {
            const newTransform = settings.disableHardwareAcceleration
                ? `translateX(${targetX}px)`
                : `translate3d(${targetX}px, 0px, 0px)`;

            // Check current style to potentially avoid setting the same value (minor optimization)
            if (this.element.style.transform !== newTransform) {
                this.element.style.transform = newTransform;
            }
            this.lastAppliedX = targetX; // Update the tracked value
        }
    }
}

export class TickManager {
    readonly poolSize: number;
    private processedHits: number;
    readonly pool: TickImpl[]; // readonly doesnt prevent us from modifying the array, only from reassigning it
    readonly activeTicks: Set<number> = new Set(); // Store indices of active ticks'
    readonly nonFadeOutTicks: Set<number> = new Set(); // Store indices of visible ticks
    constructor() {
        // TODO: add a setting for pool size
        this.poolSize = 100;
        this.processedHits = 0;
        this.pool = Array.from({ length: this.poolSize }, () => new TickImpl());
    }

    // New method to assign elements
    setElements(elements: HTMLElement[]) {
        if (elements.length !== this.poolSize) {
            console.error(`TickPool Error: Element count (${elements.length}) does not match PoolSize (${this.poolSize}).`);
            return;
        }
        for (let i = 0; i < this.poolSize; i++) {
            this.pool[i].element = elements[i];
            this.pool[i].reset(); // Reset element state upon assignment
        }
        console.log("Tick elements assigned to TickPool.");
    }


    set() {
        for (const tick of this.pool) {
            // Call instance method now
            tick.reset();
        }
        this.activeTicks.clear();
        this.nonFadeOutTicks.clear();
        this.processedHits = 0;
    }

    update(hitErrors: number[]) {
        const now = Date.now();
        const { tickDuration, fadeOutDuration } = settings;
        const timeoutThreshold = tickDuration + fadeOutDuration;
        const { rate } = cache;

        // cache class properties here
        const poolSize = this.poolSize;
        const pool = this.pool;
        const activeTicks = this.activeTicks;
        const nonFadeOutTicks = this.nonFadeOutTicks;
        const processedHits = this.processedHits;

        // Check timeouts only for active ticks
        for (const idx of activeTicks) {
            const tick = pool[idx];
            if (now - tick.timestamp > timeoutThreshold) {
                // Call instance method now
                tick.setInactive();
                activeTicks.delete(idx);
                // nonFadeOutTicks will be handled below or naturally expire
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
            const error = hitErrors[i] / rate;
            const tick = pool[poolIndex];

            // note: processedHits is a constant declaration referencing the value from the previous state
            // we'll just update it class properties and create a new processedHits in memory on the next update() call.

            if (!tick.active) {
                // Call instance method now
                tick.setActive(error);
                activeTicks.add(poolIndex);
                nonFadeOutTicks.add(poolIndex);
                this.processedHits++;
            } else {
                const processedHitsindex = processedHits - 1;
                if (i > processedHitsindex) {
                    // If we're reusing an active tick, reset it first
                    if (activeTicks.has(poolIndex)) {
                        tick.setInactive();
                        tick.setActive(error);
                    } else {
                        tick.resetActive(error);
                    }
                    // Ensure it's in nonFadeOutTicks if it was reset
                    nonFadeOutTicks.add(poolIndex);
                    this.processedHits++;
                }
            }
        }
    }
}

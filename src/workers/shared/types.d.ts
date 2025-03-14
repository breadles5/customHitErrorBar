export interface Tick {
    position: number;
    active: boolean;
    fadeout: boolean;
    timestamp: number;
    classNames: string;
    setActive(hitError: number): void;
    setFadeout(): void;
    setInactive(): void;
    resetActive(hitError: number): void
    reset(): void;
}
export interface TickPoolCache {
    localHitErrors: number[];
    timingWindows: Map<PropertyKey, number>;
    timedOutHits: number;
    processedHits: number;
}
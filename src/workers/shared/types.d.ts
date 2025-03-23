import type { TickPool } from "./tickPool";

interface TickSettings {
    tickDuration: number;
    fadeOutDuration: number;
}
export interface Tick {
    position: number;
    active: boolean;
    fadeout: boolean;
    timestamp: number;
    classNames: string;
}
export interface TickPoolCache {
    timingWindows: Map<PropertyKey, number>;
    timedOutHits: number;
    processedHits: number;
}

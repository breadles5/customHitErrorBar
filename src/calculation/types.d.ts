import type { TickManager } from "./tickManager";

export interface Tick {
    position: number;
    active: boolean;
    timestamp: number;
    classNames: string;
    element?: HTMLElement | null; // Add element property
}

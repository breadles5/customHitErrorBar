import type { TickPool } from "./tickPool";

export interface Tick {
    position: number;
    active: boolean;
    timestamp: number;
    classNames: string;
}

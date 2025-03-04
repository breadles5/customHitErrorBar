import type { Tick } from "../workers/ticks/tickPool";
import { elementCache, getElement } from "./elements";

export function renderTicks(tickPool: Tick[]): void {
    const container = getElement(".tick-container");
    if (!container) return;

    // Clear existing ticks first
    clearTicks();

    const fragment = document.createDocumentFragment();
    for (const tick of tickPool) {
        const div = document.createElement("div");
        const { position, classNames } = tick;
        div.className = classNames;
        div.style.transform = `translateX(${position}px)`;
        fragment.appendChild(div);
    }

    // Add the bar back
    const bar = document.createElement("div");
    bar.className = "bar";
    fragment.appendChild(bar);

    container.appendChild(fragment);
    console.log("[DOM] Ticks rendered");
}

export function clearTicks(): void {
    const container = getElement(".tick-container");
    if (container) {
        container.innerHTML = "";
    }
    console.log("[DOM] Ticks cleared");
}

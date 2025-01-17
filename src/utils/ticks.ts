import type { Tick } from "../workers/ticks/tickPool";

export function renderTicks(tickPool: Tick[]): void {
    for (const tick of tickPool) {
        const div = document.createElement("div");
        /*
        only setting position and classNames
        why: state management is done in the worker
        so we don't need to worry about the timing windows, fade out, active, or inactive states not having the correct classnames applied
        */
        const { position, classNames } = tick;
        const container = document.querySelector(".tick-container");
        container?.appendChild(div);
        div.className = classNames;
        div.style.transform = `translateX(${position}px)`;
    }
    console.log("[DOM] Ticks rendered");
}

export function clearTicks(): void {
    const container = document.querySelector(".tick-container");
    // reset the container
    if (container) {
        container.innerHTML = '<div class="bar"></div>';
    }
    console.log("[DOM] Ticks cleared");
}

import { elementCache, getAllElements, getElement } from "../rendering/elements";
import { cache } from "../index";

interface TickRender {
    classNames: string;
    position: number;
}

export const renderTicksOnLoad = (): void => {
    const container = getElement(".tick-container");
    if (!container) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < cache.tickPool.pool.length; i++) {
        const div = document.createElement("div");
        div.id = `${i}`;
        div.className = "tick inactive";
        fragment.appendChild(div);
    }
    container.appendChild(fragment);
    const divs = getAllElements("div");
    if (divs) {
        elementCache.set("divs", divs);
    }
};

export const resetTicks = (): void => {
    for (let i = 0; i < cache.tickPool.PoolSize; i++) {
        const tick = document.getElementById(`${i}`);
        if (!tick) continue;
        tick.className = "tick inactive";
        tick.style.transform = "translate3d(0px, 0, 0)";
    }
};
export const updateTicks = (): void => {
    for (let i = 0; i < cache.tickPool.PoolSize; i++) {
        const tick = cache.tickPool.pool[i];
        if (!tick) continue; // Skip if tick is undefined

        const tickElement = document.getElementById(`${i}`);
        if (!tickElement) continue; // Changed from return to continue to keep processing other ticks

        if (tick.classNames !== tickElement.className) {
            tickElement.className = tick.classNames;
            tickElement.style.transform = `translate3d(${tick.position}px, 0, 0)`;
        }
    }
};

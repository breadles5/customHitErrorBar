import { elementCache, getAllElements, getElement } from "../rendering/elements";
import { cache } from "../index";
import { TickPool } from "../workers/shared/tickPool";

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

const tempTickPool = new TickPool();
export const updateTicks = (): void => {
    for (let i = 0; i < cache.tickPool.PoolSize; i++) {
        const tick = cache.tickPool.pool[i];
        if (!tick) continue; // Skip if tick is undefined

        const tempTick: TickRender = tempTickPool.pool[i];
        if (!tempTick) continue; // Skip if tempTick is undefined

        const tickElement = document.getElementById(`${i}`);
        if (!tickElement) continue; // Changed from return to continue to keep processing other ticks

        if (tempTick.classNames !== tick.classNames) {
            tempTick.classNames = tick.classNames;
            tickElement.className = tempTick.classNames;
            // console.log(`[tick ${i}] className changed to ${tempTick.classNames}`);
        }

        if (tempTick.position !== tick.position) {
            tempTick.position = tick.position;
            // should allow for gpu acceleration
            tickElement.style.transform = `translate3d(${tempTick.position}px, 0, 0)`;
            // console.log(`[tick ${i}] position changed to ${tempTick.position}`);
        }
    }
};

import { getElement } from "./elements";
import { cache } from "../index";
import { TickPool } from "../workers/shared/tickPool";

interface TickRender{
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
}


// TODO: check tempTickPool ticks against cache.tickPool.pool ticks, if they share classNmaes or positions, dont rerender, otherwise, change only the position and className
let tempTickPool = new TickPool();
export const rerenderTicks = (): void => {
    for (let i = 0; i < tempTickPool.pool.length; i++) {
        const tempTick: TickRender = tempTickPool.pool[i];
        const tick = cache.tickPool.pool[i];
        const tickElement = document.getElementById(`${i}`); // i should be equal to tick.id
        if (!tickElement) return;
        
        if (tempTick.classNames !== tick.classNames) {
            tempTick.classNames = tick.classNames;
            tickElement.className = tempTick.classNames;
            // console.log("[tick ${i}] className changed to ${tempTick.classNames}");
        }

        if (tempTick.position !== tick.position) {
            tempTick.position = tick.position;
            // should allow for gpu acceleration
            tickElement.style.transform = `translate3d(${tempTick.position}px, 0, 0)`;
            // console.log("[tick ${i}] position changed to ${tempTick.position}");
        }
    }
}
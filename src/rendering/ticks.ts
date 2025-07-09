import { getElement } from "../rendering/elements"; // Only need getElement
import { cache } from "../index";
import { settings } from "../sockets/settings";

let areTicksRendered = false; // Flag to indicate if initial render is done

export const renderTicksOnLoad = (): void => {
    if (areTicksRendered) return; // Prevent re-rendering

    const container = getElement(".tick-container");
    if (!container) {
        console.error("Tick container not found!");
        return;
    }
    const fragment = document.createDocumentFragment();
    const elementsForPool: HTMLElement[] = []; // Temporary array to collect elements

    for (let i = 0; i < cache.tickPool.poolSize; i++) {
        const div = document.createElement("div");
        div.className = "tick inactive"; // Start inactive
        // Set initial transform with hardware acceleration
        div.style.transform = "translate3d(0px, 0px, 0px)";
        // div.id = `${i}`; // Optional
        fragment.appendChild(div);
        elementsForPool.push(div); // Collect element
    }
    container.appendChild(fragment);

    // Assign elements to the pool
    cache.tickPool.setElements(elementsForPool);
    areTicksRendered = true;
};

export const resetTicks = (): void => {
    // No need to reset ticks on settings change as they'll be updated on next frame
    // This function is kept for API compatibility
};
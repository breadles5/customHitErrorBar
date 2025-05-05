import { getElement } from "../rendering/elements"; // Only need getElement
import { cache } from "../index";
import { settings } from "../sockets/settings";

let areTicksRendered = false; // Flag to indicate if initial render is done
const { disableHardwareAcceleration } = settings; // Keep this for initial reset potentially

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
        // Set initial transform to avoid visual jump if reset happens before first update
        const initialTransform = disableHardwareAcceleration ? "translateX(0px)" : "translate3d(0px, 0px, 0px)";
        div.style.transform = initialTransform;
        // div.id = `${i}`; // Optional
        fragment.appendChild(div);
        elementsForPool.push(div); // Collect element
    }
    container.appendChild(fragment);

    // Pass the created elements to the TickPool
    cache.tickPool.setElements(elementsForPool);

    areTicksRendered = true; // Set flag after elements are added and assigned
    console.log(`Rendered and assigned ${elementsForPool.length} tick elements.`);
};

export const resetTicks = (): void => {
    if (!areTicksRendered) return; // Don't try to reset if not rendered

    // Delegate reset logic entirely to the TickPool
    cache.tickPool.set();
    console.log("TickPool reset triggered by resetTicks.");
};
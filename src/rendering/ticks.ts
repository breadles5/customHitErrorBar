import { getElement } from "../rendering/elements"; // Only need getElement
import { cache } from "../index";
import { settings } from "../sockets/settings";

// Module-level cache for tick DOM elements
const tickElementsArray: HTMLElement[] = [];
let areTicksRendered = false; // Flag to indicate if initial render is done

export const renderTicksOnLoad = (): void => {
    if (areTicksRendered) return; // Prevent re-rendering

    const container = getElement(".tick-container");
    if (!container) {
        console.error("Tick container not found!");
        return;
    }
    const fragment = document.createDocumentFragment();
    tickElementsArray.length = 0; // Clear array (safety for potential future re-renders)

    for (let i = 0; i < cache.tickPool.PoolSize; i++) { // Use PoolSize for consistency
        const div = document.createElement("div");
        div.className = "tick inactive";
        // div.id = `${i}`; // Optional
        fragment.appendChild(div);
        tickElementsArray.push(div); // Store reference directly
    }
    container.appendChild(fragment);
    areTicksRendered = true; // Set flag after elements are added
    console.log(`Rendered ${tickElementsArray.length} tick elements.`); // Debug log
};

export const resetTicks = (): void => {
    if (!areTicksRendered) return; // Don't try to reset if not rendered

    for (let i = 0; i < tickElementsArray.length; i++) {
        const tickElement = tickElementsArray[i];
        if (!tickElement) continue;
        tickElement.className = "tick inactive";
        if (settings.disableHardwareAcceleration) {
            tickElement.style.transform = "translateX(0px)";
            return;
        }
        tickElement.style.transform = "translate3d(0px, 0px, 0px)";
    }
};

export const updateTicks = (): void => {
    requestAnimationFrame(() => {
        const poolSize = cache.tickPool.PoolSize;
    
        for (let i = 0; i < poolSize; i++) {
            const tick = cache.tickPool.pool[i];
            const tickElement = tickElementsArray[i]; // Direct access
    
            // if you recall properly, ticks classNames and position are updated at once, so no need to make another check for position
            if (tick.classNames !== tickElement.className) {
                tickElement.className = tick.classNames;
                if (settings.disableHardwareAcceleration) {
                    tickElement.style.transform = `translateX(${tick.position}px)`;
                    return;
                }
                tickElement.style.transform = `translate3d(${tick.position}px, 0px, 0px)`;
            }
        }
    })
};
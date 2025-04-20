import { getElement } from "../rendering/elements"; // Only need getElement
import { cache } from "../index";
import { settings } from "../sockets/settings";

// Module-level cache for tick DOM elements
const tickElementsArray: HTMLElement[] = [];
const lastAppliedX: number[] = []; // Tracks the last applied X transform value
let areTicksRendered = false; // Flag to indicate if initial render is done
const { disableHardwareAcceleration } = settings;

export const renderTicksOnLoad = (): void => {
    if (areTicksRendered) return; // Prevent re-rendering

    const container = getElement(".tick-container");
    if (!container) {
        console.error("Tick container not found!");
        return;
    }
    const fragment = document.createDocumentFragment();
    tickElementsArray.length = 0; // Clear array (safety for potential future re-renders)
    lastAppliedX.length = 0; // Clear the tracking array as well

    for (let i = 0; i < cache.tickPool.PoolSize; i++) {
        // Use PoolSize for consistency
        const div = document.createElement("div");
        div.className = "tick inactive";
        // div.id = `${i}`; // Optional
        fragment.appendChild(div);
        tickElementsArray.push(div); // Store reference directly
        lastAppliedX.push(Number.NaN); // Initialize with a value that won't match 0 initially
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
        // Reset transform and tracked value
        const initialTransform = disableHardwareAcceleration ? "translateX(0px)" : "translate3d(0px, 0px, 0px)";
        if (tickElement.style.transform !== initialTransform) {
            tickElement.style.transform = initialTransform;
        }
        lastAppliedX[i] = 0; // Reset tracked position to 0
    }
};

export const updateTicks = (): void => {
    requestAnimationFrame(() => {
        const poolSize = cache.tickPool.PoolSize;

        for (let i = 0; i < poolSize; i++) {
            const tick = cache.tickPool.pool[i];
            const tickElement = tickElementsArray[i]; // Direct access

            // Update transform only if the position has actually changed
            const targetX = tick.position;
            const lastX = lastAppliedX[i];

            if (targetX !== lastX) {
                const newTransform = disableHardwareAcceleration
                    ? `translateX(${targetX}px)`
                    : `translate3d(${targetX}px, 0px, 0px)`;

                // Check current style to potentially avoid setting the same value (minor optimization)
                if (tickElement.style.transform !== newTransform) {
                    tickElement.style.transform = newTransform;
                }
                lastAppliedX[i] = targetX; // Update the tracked value

                // Update class name if needed
                if (tick.classNames !== tickElement.className) {
                    tickElement.className = tick.classNames;
                }
            }
        }
    });
};

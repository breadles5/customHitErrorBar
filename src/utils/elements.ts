import { cache } from "../index.ts";
import { renderTicksOnLoad } from "./ticks.ts";

// DOM elements with memoization
export const elementCache = new Map<string, HTMLElement | NodeListOf<HTMLElement>>();

export const getElement = (selector: string): HTMLElement | null => {
    if (!elementCache.has(selector)) {
        elementCache.set(selector, <HTMLElement>document.querySelector(selector));
    }
    return <HTMLElement | null>elementCache.get(selector);
};

export const getAllElements = (selector: string): NodeListOf<HTMLElement> | null => {
    if (!elementCache.has(selector)) {
        elementCache.set(selector, <NodeListOf<HTMLElement>>document.querySelectorAll(selector));
    }
    return <NodeListOf<HTMLElement> | null>elementCache.get(selector);
};

// Clear cache on page unload
window.addEventListener("unload", () => {
    elementCache.clear();
});

export const setHidden = () => getAllElements("div")?.forEach((div) => div.classList.add("hidden"));
export const setVisible = () => getAllElements("div")?.forEach((div) => div.classList.remove("hidden"));

// Add hidden class to all elements by default
setHidden();

export const clearSD = (): void => {
    const sd = getElement(".sd");
    if (sd) {
        sd.textContent = "0.00";
    }
};

// Update timing window display in the DOM
export function updateTimingWindowElements() {
    const timingWindows = cache.timingWindows;
    const colorsContainer = getElement(".colors-container");

    // Clear existing timing windows
    if (colorsContainer) {
        colorsContainer.innerHTML = "";
    }

    // Set container widths based on miss window (0)
    const containerWidth = Math.abs(timingWindows.get("0") ?? 0) * 4;
    document.documentElement.style.setProperty("--container-width", `${containerWidth}px`);

    // Helper function to create timing window element
    const createTimingWindow = (grade: string, width: number): HTMLElement => {
        const div = document.createElement("div");
        div.className = `timing-window-${grade}`;
        div.style.width = `${Math.abs(width * 4)}px`;
        return div;
    };

    timingWindows.forEach((width, grade) => {
        colorsContainer?.appendChild(createTimingWindow(String(grade), width));
    });
}

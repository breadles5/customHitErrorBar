import { cache } from "../index.ts";

// DOM elements with memoization
export const elementCache = new Map<string, HTMLElement | NodeListOf<HTMLElement>>();

const getElement = (selector: string): HTMLElement | null => {
    if (!elementCache.has(selector)) {
        elementCache.set(selector, document.querySelector(selector) as HTMLElement);
    }
    return elementCache.get(selector) as HTMLElement | null;
};

const getAllElements = (selector: string): NodeListOf<HTMLElement> | null => {
    if (!elementCache.has(selector)) {
        elementCache.set(selector, document.querySelectorAll(selector) as NodeListOf<HTMLElement>);
    }
    return elementCache.get(selector) as NodeListOf<HTMLElement> | null;
};

// Export cached DOM elements
export const elements = {
    get tickContainer(): HTMLElement | null {
        return getElement(".tick-container");
    },
    get arrow(): HTMLElement | null {
        return getElement(".arrow");
    },
    get allDivs(): NodeListOf<HTMLElement> | null {
        return getAllElements("div");
    },
    get sd(): HTMLElement | null {
        return getElement(".sd");
    },
    get colorsContainer(): HTMLElement | null {
        return getElement(".colors-container");
    },
    get bar(): HTMLElement | null {
        return getElement(".bar");
    },
};

// Clear cache on page unload
window.addEventListener("unload", () => {
    elementCache.clear();
});

export const setHidden = () => elements.allDivs?.forEach((div) => div.classList.add("hidden"));
export const setVisible = () => elements.allDivs?.forEach((div) => div.classList.remove("hidden"));

// Add hidden class to all elements by default
setHidden();

export const clearSD = (): void => {
    if (elements.sd) {
        elements.sd.textContent = "0.00";
    }
}

// Update timing window display in the DOM
export async function updateTimingWindowElements() {
    const timingWindows = cache.timingWindows as { [key: string]: number };
    const colorsContainer = document.querySelector(".colors-container");
    console.log("Timing windows:", timingWindows);

    // Clear existing timing windows
    if (colorsContainer) {
        colorsContainer.innerHTML = "";
    }

    // Set container widths based on miss window (0)
    const containerWidth = Math.abs(timingWindows[0] * 4);
    document.documentElement.style.setProperty("--container-width", `${containerWidth}px`);

    // Helper function to create timing window element
    const createTimingWindow = (grade: string, width: number): HTMLElement => {
        const div = document.createElement("div");
        div.className = `timing-window-${grade}`;
        div.style.width = `${Math.abs(width * 4)}px`;
        return div;
    };

    // Add timing windows based on gamemode
    const maniaTimingWindowGrades: string[] = ["300g", "200", "100", "50", "0"];
    const otherTimingWindowGrades: string[] = ["300", "100", "50", "0"];
    const timingWindowGrades = cache.mode === "mania" ? maniaTimingWindowGrades : otherTimingWindowGrades;

    timingWindowGrades.forEach((grade) => {
        const width = timingWindows[grade];
        colorsContainer?.appendChild(createTimingWindow(String(grade), width));
    });
}

import type { Settings } from "../sockets/types";

// Initialize empty settings object with defaults to avoid undefined checks
export const settings: Settings = {
    TimingWindowOpacity: 0,
    barHeight: 0,
    barWidth: 0,
    colorBar: "#000000",
    tickWidth: 0,
    tickHeight: 0,
    tickDuration: 0,
    tickOpacity: 0,
    fadeOutDuration: 0,
    arrowSize: 0,
    perfectArrowThreshold: 0,
    colorArrowEarly: "#000000",
    colorArrowLate: "#000000",
    colorArrowPerfect: "#000000",
    timingWindowHeight: 0,
    isRounded: 0,
    color300g: "#000000",
    color300: "#000000",
    color200: "#000000",
    color100: "#000000",
    color50: "#000000",
    color0: "#000000",
    showSD: true,
    visible: true,
};

// Cache DOM element
// damn shit runs in browser, but dev server doesn't know what the fuck document is since it's not a browser (its a node js environment)
const root = typeof document !== "undefined" ? document.documentElement : { style: { setProperty: () => {} } };

// Cache calculated values
let lastWindowHeight = 0;
let lastRoundedPercent = 0;

export function getSettings() {
    return settings;
}

// Update settings with new values
export const updateSettings = (message: Partial<Settings>) => {
    const oldSettings = { ...settings };

    // Update changed settings only
    let hasVisualChanges = false;
    let hasLayoutChanges = false;

    for (const [key, value] of Object.entries(message)) {
        if (Object.prototype.hasOwnProperty.call(settings, key) && settings[key as keyof Settings] !== value) {
            settings[key as keyof Settings] = value as never;

            // Track what kind of changes occurred
            if (key.startsWith("color") || key === "TimingWindowOpacity") {
                hasVisualChanges = true;
            } else if (key !== "showSD") {
                hasLayoutChanges = true;
            }
        }
    }

    // Apply changes
    if (hasLayoutChanges) {
        updateCSSLayout();
    }
    if (hasVisualChanges) {
        updateCSSColors();
    }

    // Update visibility if needed
    if (Object.prototype.hasOwnProperty.call(message, "showSD") && oldSettings.showSD !== message.showSD) {
        updateVisibility();
    }
};

// Split CSS updates into layout and colors
const updateCSSLayout = () => {
    // Update size-related variables
    root.style.setProperty("--fade-out-duration", `${settings.fadeOutDuration}ms`);
    root.style.setProperty("--tick-duration", `${settings.tickDuration}ms`);
    root.style.setProperty("--bar-height", `${settings.barHeight}px`);
    root.style.setProperty("--bar-width", `${settings.barWidth}px`);
    root.style.setProperty("--tick-width", `${settings.tickWidth}px`);
    root.style.setProperty("--tick-height", `${settings.tickHeight}px`);
    root.style.setProperty("--arrow-size", `${settings.arrowSize}px`);

    // Calculate timing window height only if changed
    const windowHeight = settings.barHeight * (settings.timingWindowHeight / 100);
    if (windowHeight !== lastWindowHeight) {
        lastWindowHeight = windowHeight;
        const clampedHeight = Math.max(0, Math.min(100, settings.timingWindowHeight));
        root.style.setProperty("--timing-window-height", `${clampedHeight}`);
    }

    // Calculate rounded corners only if changed
    const roundedPercent = Math.max(0, Math.min(100, settings.isRounded)) / 100;
    if (roundedPercent !== lastRoundedPercent) {
        lastRoundedPercent = roundedPercent;

        const windowRadius = (windowHeight / 2) * roundedPercent;
        const barRadius = (settings.barWidth / 2) * roundedPercent;
        const tickRadius = (settings.tickWidth / 2) * roundedPercent;

        root.style.setProperty("--timing-window-radius", `${windowRadius}px`);
        root.style.setProperty("--bar-radius", `${barRadius}px`);
        root.style.setProperty("--tick-radius", `${tickRadius}px`);
    }
};

const updateCSSColors = () => {
    root.style.setProperty("--timing-windows-opacity", String(settings.TimingWindowOpacity));
    root.style.setProperty("--tick-opacity", String(settings.tickOpacity));
    root.style.setProperty("--color-300g", settings.color300g);
    root.style.setProperty("--color-300", settings.color300);
    root.style.setProperty("--color-200", settings.color200);
    root.style.setProperty("--color-100", settings.color100);
    root.style.setProperty("--color-50", settings.color50);
    root.style.setProperty("--color-0", settings.color0);
    root.style.setProperty("--arrow-early", settings.colorArrowEarly);
    root.style.setProperty("--arrow-late", settings.colorArrowLate);
    root.style.setProperty("--arrow-perfect", settings.colorArrowPerfect);
    root.style.setProperty("--bar-color", settings.colorBar);
};

export const updateVisibility = () => {
    const sd = document.querySelector(".sd") as HTMLElement | null;
    if (sd) {
        sd.style.display = settings.showSD ? "block" : "none";
    }
};

// Update CSS variables
export const updateCSSVariables = () => {
    // Update layout variables
    updateCSSLayout();
    // Update color variables
    updateCSSColors();
};

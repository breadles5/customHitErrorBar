import type { Settings } from "../sockets/types";
import { getElement } from "../rendering/elements";
/*
    lets agree to never touch this file again
    it's a mess
*/

export const settings: Settings = {
    TimingWindowOpacity: 0,
    barHeight: 60,
    barWidth: 8,
    colorBar: "#bf0000",
    tickWidth: 8,
    tickHeight: 40,
    tickDuration: 500,
    tickOpacity: 0.75,
    fadeOutDuration: 800,
    arrowSize: 25,
    perfectArrowThreshold: 5,
    colorArrowEarly: "#0080ff",
    colorArrowLate: "#ff0000",
    colorArrowPerfect: "#ffffff",
    timingWindowHeight: 40,
    isRounded: 100,
    color300g: "transparent",
    color300: "transparent",
    color200: "transparent",
    color100: "transparent",
    color50: "transparent",
    color0: "transparent",
    showSD: false,
    useCustomTimingWindows: false,
    customTimingWindows: "16.5,64,97,127,151",
};
// define root element
const root = typeof document !== "undefined" ? document.documentElement : { style: { setProperty: () => {} } };

// Cache calculated values
let lastWindowHeight = 0;
let lastRoundedPercent = 0;

export const getSettings = () => {
    return settings;
};

// Update settings with new values
export const updateSettings = (message: Partial<Settings>) => {
    const oldSettings = { ...settings };

    // Update changed settings only
    let hasVisualChanges = false;
    let hasLayoutChanges = false;

    for (const [key, value] of Object.entries(message)) {
        const typedKey = key as keyof Settings;
        if (Object.prototype.hasOwnProperty.call(settings, typedKey) && settings[typedKey] !== value) {
            settings[<keyof Settings>key] = <never>value;

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
    const { barWidth, barHeight, tickWidth, tickHeight, timingWindowHeight, isRounded } = settings;
    
    // Calculate and set CSS variables
    const windowHeight = window.innerHeight;
    const timingWindowHeightPx = (barHeight * timingWindowHeight) / 100;
    
    // Only update if the window height has changed significantly (to prevent layout thrashing)
    if (Math.abs(windowHeight - lastWindowHeight) > 1) {
        root.style.setProperty("--window-height", `${windowHeight}px`);
        lastWindowHeight = windowHeight;
    }
    
    // Only update if the rounded percentage has changed
    const roundedPercent = Math.min(100, Math.max(0, isRounded));
    if (roundedPercent !== lastRoundedPercent) {
        root.style.setProperty("--border-radius", `${roundedPercent}%`);
        lastRoundedPercent = roundedPercent;
    }
    
    // Set other layout properties
    root.style.setProperty("--bar-width", `${barWidth}px`);
    root.style.setProperty("--bar-height", `${barHeight}px`);
    root.style.setProperty("--tick-width", `${tickWidth}px`);
    root.style.setProperty("--tick-height", `${tickHeight}px`);
    root.style.setProperty("--timing-window-height", `${timingWindowHeightPx}px`);
};

const updateCSSColors = () => {
    const { colorBar, color300g, color300, color200, color100, color50, color0, colorArrowEarly, colorArrowLate, colorArrowPerfect, TimingWindowOpacity } = settings;
    
    // Set color variables
    root.style.setProperty("--color-bar", colorBar);
    root.style.setProperty("--color-300g", color300g);
    root.style.setProperty("--color-300", color300);
    root.style.setProperty("--color-200", color200);
    root.style.setProperty("--color-100", color100);
    root.style.setProperty("--color-50", color50);
    root.style.setProperty("--color-0", color0);
    root.style.setProperty("--color-arrow-early", colorArrowEarly);
    root.style.setProperty("--color-arrow-late", colorArrowLate);
    root.style.setProperty("--color-arrow-perfect", colorArrowPerfect);
    root.style.setProperty("--timing-window-opacity", TimingWindowOpacity.toString());
};

const updateVisibility = () => {
    const sdElement = getElement(".sd");
    if (sdElement) {
        sdElement.style.display = settings.showSD ? "block" : "none";
    }
};

// Update CSS variables
export const updateCSSVariables = () => {
    updateCSSLayout();
    updateCSSColors();
    updateVisibility();
};

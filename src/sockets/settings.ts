import { getElement } from "../rendering/elements";

export interface Settings {
    TimingWindowOpacity: number;
    barHeight: number;
    barWidth: number;
    colorBar: string;
    tickWidth: number;
    tickHeight: number;
    tickDuration: number;
    tickOpacity: number;
    fadeOutDuration: number;
    arrowSize: number;
    perfectArrowThreshold: number;
    colorArrowEarly: string;
    colorArrowLate: string;
    colorArrowPerfect: string;
    timingWindowHeight: number;
    isRounded: number;
    color300g: string;
    color300: string;
    color200: string;
    color100: string;
    color50: string;
    color0: string;
    showSD: boolean;
    useCustomTimingWindows: boolean;
    customTimingWindows: string;
}

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
const SETTINGS_LOG_PREFIX = "[SETTINGS]";

export const getSettings = () => {
    console.log(`${SETTINGS_LOG_PREFIX} Returning current settings snapshot`, settings);
    return settings;
};

// Update settings with new values
export const updateSettings = (message: Partial<Settings>) => {
    console.log(`${SETTINGS_LOG_PREFIX} Applying settings update`, message);

    const oldSettings = { ...settings };

    // Update changed settings only
    let hasVisualChanges = false;
    let hasLayoutChanges = false;
    const changedKeys: string[] = [];

    for (const [key, value] of Object.entries(message)) {
        const typedKey = key as keyof Settings;
        if (Object.prototype.hasOwnProperty.call(settings, typedKey) && settings[typedKey] !== value) {
            settings[<keyof Settings>key] = <never>value;
            changedKeys.push(key);

            // Track what kind of changes occurred
            if (key.startsWith("color") || key === "TimingWindowOpacity") {
                hasVisualChanges = true;
            } else if (key !== "showSD") {
                hasLayoutChanges = true;
            }
        }
    }

    if (changedKeys.length === 0) {
        console.log(`${SETTINGS_LOG_PREFIX} No changes detected in incoming update.`);
    } else {
        console.log(`${SETTINGS_LOG_PREFIX} Updated keys: ${changedKeys.join(", ")}`);
    }

    // Apply changes
    if (hasLayoutChanges) {
        console.log(`${SETTINGS_LOG_PREFIX} Applying layout-related CSS updates.`);
        updateCSSLayout();
    }
    if (hasVisualChanges) {
        console.log(`${SETTINGS_LOG_PREFIX} Applying visual-related CSS updates.`);
        updateCSSColors();
    }

    // Update visibility if needed
    if (Object.prototype.hasOwnProperty.call(message, "showSD") && oldSettings.showSD !== message.showSD) {
        console.log(`${SETTINGS_LOG_PREFIX} Toggling SD visibility to ${settings.showSD ? "visible" : "hidden"}.`);
        updateVisibility();
    }
};

// Split CSS updates into layout and colors
const updateCSSLayout = () => {
    const { barWidth, barHeight, tickWidth, tickHeight, timingWindowHeight, isRounded } = settings;
    const windowHeight = window.innerHeight;
    const timingWindowHeightPx = (barHeight * timingWindowHeight) / 100;
    if (Math.abs(windowHeight - lastWindowHeight) > 1) {
        root.style.setProperty("--window-height", `${windowHeight}px`);
        lastWindowHeight = windowHeight;
    }
    const roundedPercent = Math.min(100, Math.max(0, isRounded));
    if (roundedPercent !== lastRoundedPercent) {
        root.style.setProperty("--border-radius", `${roundedPercent}%`);
        lastRoundedPercent = roundedPercent;
    }
    const radiusScale = roundedPercent / 100;
    const barRadiusPx = (barWidth / 2) * radiusScale;
    const tickRadiusPx = (tickWidth / 2) * radiusScale;
    const timingWindowRadiusPx = (timingWindowHeightPx / 2) * radiusScale;
    root.style.setProperty("--bar-radius", `${barRadiusPx}px`);
    root.style.setProperty("--tick-radius", `${tickRadiusPx}px`);
    root.style.setProperty("--timing-window-radius", `${timingWindowRadiusPx}px`);
    root.style.setProperty("--bar-width", `${barWidth}px`);
    root.style.setProperty("--bar-height", `${barHeight}px`);
    root.style.setProperty("--tick-width", `${tickWidth}px`);
    root.style.setProperty("--tick-height", `${tickHeight}px`);
    root.style.setProperty("--timing-window-height", `${timingWindowHeightPx}px`);
    console.log(`${SETTINGS_LOG_PREFIX} Calculated radii (px)`, { barRadiusPx, tickRadiusPx, timingWindowRadiusPx });
};

const updateCSSColors = () => {
    const {
        colorBar,
        color300g,
        color300,
        color200,
        color100,
        color50,
        color0,
        colorArrowEarly,
        colorArrowLate,
        colorArrowPerfect,
        TimingWindowOpacity,
    } = settings;

    // Set color variables
    root.style.setProperty("--color-bar", colorBar);
    root.style.setProperty("--bar-color", colorBar);
    root.style.setProperty("--color-300g", color300g);
    root.style.setProperty("--color-300", color300);
    root.style.setProperty("--color-200", color200);
    root.style.setProperty("--color-100", color100);
    root.style.setProperty("--color-50", color50);
    root.style.setProperty("--color-0", color0);
    root.style.setProperty("--color-arrow-early", colorArrowEarly);
    root.style.setProperty("--arrow-early", colorArrowEarly);
    root.style.setProperty("--color-arrow-late", colorArrowLate);
    root.style.setProperty("--arrow-late", colorArrowLate);
    root.style.setProperty("--color-arrow-perfect", colorArrowPerfect);
    root.style.setProperty("--arrow-perfect", colorArrowPerfect);
    root.style.setProperty("--timing-window-opacity", TimingWindowOpacity.toString());
    root.style.setProperty("--timing-windows-opacity", TimingWindowOpacity.toString());
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

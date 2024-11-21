import { settings } from './settings.js';

// DOM elements with memoization
const elementCache = new Map();

const getElement = (selector) => {
    if (!elementCache.has(selector)) {
        elementCache.set(selector, document.querySelector(selector));
    }
    return elementCache.get(selector);
};

const getAllElements = (selector) => {
    if (!elementCache.has(selector)) {
        elementCache.set(selector, document.querySelectorAll(selector));
    }
    return elementCache.get(selector);
};

// Export cached DOM elements
export const elements = {
    get tickContainer() { return getElement(".tick-container"); },
    get arrow() { return getElement(".arrow"); },
    get allDivs() { return getAllElements("div"); },
    get sd() { return getElement(".sd"); },
    get colorsContainer() { return getElement(".colors-container"); },
    get bar() { return getElement(".bar"); }
};

// Clear cache on page unload
window.addEventListener('unload', () => {
    elementCache.clear();
});

// Add hidden class to all elements by default
elements.allDivs?.forEach(div => div.classList.add('hidden'));

// Helper functions for color calculations
export const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export const getArrowColor = (error) => {
    const absError = Math.abs(error);
    const threshold = settings.PerfectArrowThreshold;
    if (absError <= threshold) {
        return 'var(--arrow-perfect)';
    } else if (error < 0) {
        return 'var(--arrow-early)';
    } else {
        return 'var(--arrow-late)';
    }
};

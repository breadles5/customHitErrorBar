import { settings } from './settings.js';

// Calculate average of array
export const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
};

// Get arrow color based on hit error
export const getArrowColor = (hitError) => {
    const threshold = settings.PerfectArrowThreshold;
    const absError = Math.abs(hitError);

    if (absError <= threshold) {
        return 'var(--arrow-perfect)';
    } else if (hitError < 0) {
        return 'var(--arrow-early)';
    } else {
        return 'var(--arrow-late)';
    }
};

// DOM elements
export const elements = {
    tickContainer: document.querySelector(".tick-container"),
    arrow: document.querySelector(".arrow"),
    allDivs: document.querySelectorAll("div"),
    sd: document.querySelector(".sd"),
    colorsContainer: document.querySelector(".colors-container"),
};

// Add hidden class to all elements by default
elements.allDivs.forEach(div => div.classList.add('hidden'));

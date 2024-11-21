// Initialize empty settings object with defaults to avoid undefined checks
export let settings = {
    TimingWindowOpacity: 0.4,
    barHeight: 60,
    barWidth: 10,
    tickWidth: 10,
    tickHeight:50,
    tickDuration: 1500,
    fadeOutDuration: 300,
    arrowSize: 30,
    timingWindowHeight: 50,
    isRounded: 100,
    color300g: '#66CCFF',
    color300: '#66FF66',
    color200: '#FFFF66',
    color100: '#FFAA33',
    color50: '#FF6666',
    color0: '#FF0000',
    showSD: true,
    visible: true
};

// Cache DOM element
const root = document.documentElement;

// Cache calculated values
let lastWindowHeight = 0;
let lastRoundedPercent = 0;
let cssCache = new Map();

export function getSettings() {
    return settings;
}

// Update settings with new values
export function updateSettings(message) {
    const oldSettings = { ...settings };
    
    // Update changed settings only
    let hasVisualChanges = false;
    let hasLayoutChanges = false;
    
    for (const [key, value] of Object.entries(message)) {
        if (settings[key] !== value) {
            settings[key] = value;
            
            // Track what kind of changes occurred
            if (key.startsWith('color') || key === 'TimingWindowOpacity') {
                hasVisualChanges = true;
            } else {
                hasLayoutChanges = true;
            }
        }
    }
    
    // Only update what changed
    if (hasLayoutChanges) {
        updateCSSLayout();
    }
    if (hasVisualChanges) {
        updateCSSColors();
    }
    
    // Update visibility if needed
    if (message.hasOwnProperty('showSD') && oldSettings.showSD !== message.showSD) {
        updateVisibility();
    }
}

// Split CSS updates into layout and colors
const updateCSSLayout = () => {
    // Update size-related variables
    root.style.setProperty('--bar-height', `${settings.barHeight}px`);
    root.style.setProperty('--bar-width', `${settings.barWidth}px`);
    root.style.setProperty('--tick-width', `${settings.tickWidth}px`);
    root.style.setProperty('--tick-height', `${settings.tickHeight}px`);
    root.style.setProperty('--arrow-size', `${settings.arrowSize}px`);
    
    // Calculate timing window height only if changed
    const windowHeight = settings.barHeight * (settings.timingWindowHeight / 100);
    if (windowHeight !== lastWindowHeight) {
        lastWindowHeight = windowHeight;
        const clampedHeight = Math.max(0, Math.min(100, settings.timingWindowHeight));
        root.style.setProperty('--timing-window-height', clampedHeight);
    }
    
    // Calculate rounded corners only if changed
    const roundedPercent = Math.max(0, Math.min(100, settings.isRounded)) / 100;
    if (roundedPercent !== lastRoundedPercent) {
        lastRoundedPercent = roundedPercent;
        
        const windowRadius = (windowHeight / 2) * roundedPercent;
        const barRadius = (settings.barWidth / 2) * roundedPercent;
        const tickRadius = (settings.tickWidth / 2) * roundedPercent;
        
        root.style.setProperty('--timing-window-radius', `${windowRadius}px`);
        root.style.setProperty('--bar-radius', `${barRadius}px`);
        root.style.setProperty('--tick-radius', `${tickRadius}px`);
    }
};

const updateCSSColors = () => {
    root.style.setProperty('--timing-windows-opacity', settings.TimingWindowOpacity);
    root.style.setProperty('--color-300g', settings.color300g);
    root.style.setProperty('--color-300', settings.color300);
    root.style.setProperty('--color-200', settings.color200);
    root.style.setProperty('--color-100', settings.color100);
    root.style.setProperty('--color-50', settings.color50);
    root.style.setProperty('--color-0', settings.color0);
    root.style.setProperty('--arrow-early', settings.colorArrowEarly);
    root.style.setProperty('--arrow-late', settings.colorArrowLate);
    root.style.setProperty('--arrow-perfect', settings.colorArrowPerfect);
    root.style.setProperty('--bar-color', settings.colorBar);
};

export const updateVisibility = () => {
    const sd = document.querySelector('.sd');
    if (sd) {
        sd.style.display = settings.showSD ? 'block' : 'none';
    }
};

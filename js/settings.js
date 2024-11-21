// Initialize empty settings object
export let settings = {};

export function getSettings() {
    return settings;
}

// Update settings with new values
export function updateSettings(message) {
    // Update all settings from message
    Object.assign(settings, message);
    
    // Update CSS variables and visibility
    updateCSSVariables();
    updateVisibility();
}

export const updateCSSVariables = () => {
    const root = document.documentElement;

    // Update existing variables
    root.style.setProperty('--timing-windows-opacity', settings.TimingWindowOpacity);
    root.style.setProperty('--bar-height', `${settings.barHeight}px`);
    root.style.setProperty('--bar-width', `${settings.barWidth}px`);
    root.style.setProperty('--tick-width', `${settings.tickWidth}px`);
    root.style.setProperty('--tick-height', `${settings.tickHeight}px`);
    root.style.setProperty('--tick-duration', `${settings.tickDuration}ms`);
    root.style.setProperty('--fade-out-duration', `${settings.fadeOutDuration}ms`);
    root.style.setProperty('--arrow-size', `${settings.arrowSize}px`);

    // Add timing window height (clamped between 0-100)
    const clampedHeight = Math.max(0, Math.min(100, settings.timingWindowHeight));
    root.style.setProperty('--timing-window-height', clampedHeight);

    // Calculate rounded corners based on percentage
    const roundedPercent = Math.max(0, Math.min(100, settings.isRounded)) / 100;

    // For timing windows, use percentage of height since they're horizontal elements
    const windowHeight = settings.barHeight * (settings.timingWindowHeight / 100);
    const windowRadius = (windowHeight / 2) * roundedPercent;
    root.style.setProperty('--timing-window-radius', `${windowRadius}px`);

    // For bar and ticks, use percentage of width since they're vertical elements
    const barRadius = (settings.barWidth / 2) * roundedPercent;
    const tickRadius = (settings.tickWidth / 2) * roundedPercent;
    root.style.setProperty('--bar-radius', `${barRadius}px`);
    root.style.setProperty('--tick-radius', `${tickRadius}px`);

    // Update colors
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

function updateVisibility() {
    const sd = document.querySelector('.sd');
    if (sd) {
        sd.style.display = settings.showSD ? 'block' : 'none';
    }
}

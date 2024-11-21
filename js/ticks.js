import { settings } from './settings.js';
import { elements } from './elements.js';
import { calculateTimingWindowsForGamemode } from './timingWindows.js';

export const createTick = (hitError, gamemode, od, mods) => {
    const timingWindows = calculateTimingWindowsForGamemode(gamemode, od, mods);
    const hitErrorAbs = Math.abs(hitError);
    
    const tick = document.createElement('div');
    tick.className = 'tick';

    // Set color based on timing window and gamemode
    if (gamemode === 'mania') {
        if (hitErrorAbs <= timingWindows['300g']) {
            tick.classList.add('marvelous');
        } else if (hitErrorAbs <= timingWindows[300]) {
            tick.classList.add('perfect');
        } else if (hitErrorAbs <= timingWindows[200]) {
            tick.classList.add('great');
        } else if (hitErrorAbs <= timingWindows[100]) {
            tick.classList.add('good');
        } else if (hitErrorAbs <= timingWindows[50]) {
            tick.classList.add('bad');
        } else {
            tick.classList.add('miss');
        }
    } else {
        // Standard, Taiko, Fruits
        if (hitErrorAbs <= timingWindows[300]) {
            tick.classList.add('perfect');
        } else if (hitErrorAbs <= timingWindows[100]) {
            tick.classList.add('good');
        } else if (hitErrorAbs <= timingWindows[50]) {
            tick.classList.add('bad');
        } else {
            tick.classList.add('miss');
        }
    }

    // Position the tick
    const position = hitError * 2.5; // Scale factor for visual representation
    if (position > timingWindows[0] * 2.5) {
        position = timingWindows[0] * 2.5;
    }
    tick.style.transform = `translateX(${position}px)`;

    // Add to container and start fade out
    if (elements.tickContainer) {
        elements.tickContainer.appendChild(tick);

        // Start fade out after tick duration
        setTimeout(() => {
            tick.classList.add('fade-out');
        }, settings.tickDuration);

        // Remove tick after fade out completes
        setTimeout(() => {
            if (tick.parentNode) {
                tick.parentNode.removeChild(tick);
            }
        }, settings.tickDuration + settings.fadeOutDuration);
    }
};

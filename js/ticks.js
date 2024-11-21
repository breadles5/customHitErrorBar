import { settings } from './settings.js';
import { elements } from './elements.js';
import { calculateTimingWindowsForGamemode } from './timingWindows.js';

// Object pool for tick elements
const tickPool = {
    pool: [],
    maxSize: 50, // Match localHitErrors max size

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        const tick = document.createElement('div');
        tick.className = 'tick';
        return tick;
    },

    release(tick) {
        if (this.pool.length < this.maxSize) {
            // Reset tick state
            tick.className = 'tick';
            tick.style.transform = '';
            this.pool.push(tick);
        } else {
            tick.remove();
        }
    }
};

export const createTick = (hitError, gamemode, od, mods) => {
    const timingWindows = calculateTimingWindowsForGamemode(gamemode, od, mods);
    const hitErrorAbs = Math.abs(hitError);
    
    // Get tick from pool instead of creating new element
    const tick = tickPool.get();
    
    // Reset any existing classes
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

        // Return tick to pool after fade out completes
        setTimeout(() => {
            if (tick.parentNode) {
                tick.classList.remove('fade-out');
                tickPool.release(tick);
            }
        }, settings.tickDuration + settings.fadeOutDuration);
    }
};

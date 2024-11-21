import { elements } from './elements.js';
import { calculateTimingWindowsForGamemode } from './timingWindows.js';
import { getSettings } from './settings.js';

// Constants
const VIEWPORT_WIDTH = 940; // Max miss timing window (188ms) * 5
const BUFFER_SIZE = 200; // Extra buffer on each side for smooth scrolling

// Virtual scrolling state
const activeTicks = new Map(); // Map of active ticks by timestamp
let lastCleanup = 0;

// Tick pool management
const POOL_SIZE = 200;
const tickPool = {
    pool: new Array(POOL_SIZE),
    index: 0,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        for (let i = 0; i < POOL_SIZE; i++) {
            const tick = document.createElement('div');
            tick.style.position = 'absolute';
            tick.style.willChange = 'transform';
            this.pool[i] = tick;
        }
        this.initialized = true;
    },
    
    get() {
        if (!this.initialized) this.init();
        
        // Reuse existing tick if available
        for (let i = 0; i < POOL_SIZE; i++) {
            const idx = (this.index + i) % POOL_SIZE;
            if (!this.pool[idx].parentNode) {
                this.index = (idx + 1) % POOL_SIZE;
                return this.pool[idx];
            }
        }
        
        // If no ticks available, reuse oldest
        const tick = this.pool[this.index];
        if (tick.parentNode) {
            tick.parentNode.removeChild(tick);
        }
        this.index = (this.index + 1) % POOL_SIZE;
        return tick;
    },
    
    release(tick) {
        // Clear any existing classes and styles
        tick.className = '';
        tick.style.transform = '';
        if (tick.parentNode) {
            tick.parentNode.removeChild(tick);
        }
    }
};

// Pre-calculate transform strings
const transformCache = new Map();
const getTransformString = (position) => {
    const key = Math.round(position * 10) / 10; // Round to 1 decimal place
    let transform = transformCache.get(key);
    if (!transform) {
        transform = `translateX(${key}px)`;
        if (transformCache.size < 1000) { // Limit cache size
            transformCache.set(key, transform);
        }
    }
    return transform;
};

// Optimize position setting
const setTickPosition = (tick, hitError) => {
    const position = hitError * 2.5;
    tick.style.transform = getTransformString(position);
    return position;
};

// Batch DOM operations
const pendingRemovals = [];
const processPendingRemovals = () => {
    if (pendingRemovals.length === 0) return;
    
    const fragment = document.createDocumentFragment();
    for (const tick of pendingRemovals) {
        if (tick.parentNode === elements.tickContainer) {
            fragment.appendChild(tick);
        }
    }
    
    if (fragment.childNodes.length > 0) {
        requestAnimationFrame(() => {
            for (const tick of fragment.childNodes) {
                tickPool.release(tick);
            }
        });
    }
    
    pendingRemovals.length = 0;
};

// Check if tick is in viewport
const isInViewport = (position) => {
    // Since viewport is centered, check if position is within ±(VIEWPORT_WIDTH/2)
    return Math.abs(position) <= (VIEWPORT_WIDTH / 2) + BUFFER_SIZE;
};

// Cleanup old and out-of-viewport ticks
const cleanupTicks = () => {
    const now = Date.now();
    const settings = getSettings();
    
    if (now - lastCleanup < 100) return;
    lastCleanup = now;
    
    const ticksToRemove = [];
    
    for (const [timestamp, tick] of activeTicks.entries()) {
        const age = now - timestamp;
        if (age >= settings.tickDuration) {
            ticksToRemove.push([timestamp, tick]);
            continue;
        }
        
        // Only check viewport for visible ticks
        if (tick.parentNode === elements.tickContainer) {
            const transform = tick.style.transform;
            const position = transform ? 
                parseFloat(transform.match(/-?\d+\.?\d*/)?.[0] || '0') : 0;
                
            if (!isInViewport(position)) {
                ticksToRemove.push([timestamp, tick]);
            }
        }
    }
    
    // Batch process removals
    if (ticksToRemove.length > 0) {
        for (const [timestamp, tick] of ticksToRemove) {
            tick.classList.add('fade-out');
            activeTicks.delete(timestamp);
            
            setTimeout(() => {
                pendingRemovals.push(tick);
                if (pendingRemovals.length === 1) {
                    requestAnimationFrame(processPendingRemovals);
                }
            }, settings.fadeOutDuration);
        }
    }
};

// Cache for timing windows
const timingWindowCache = new Map();

export const createTick = async (hitError, gamemode, od, mods) => {
    // Check if timing windows are cached
    const cacheKey = `${gamemode}-${od}-${mods}`;
    let timingWindows = timingWindowCache.get(cacheKey);
    
    if (!timingWindows) {
        timingWindows = await calculateTimingWindowsForGamemode(gamemode, od, mods);
        timingWindowCache.set(cacheKey, timingWindows);
    }

    // Calculate position
    const position = hitError * 2.5;
    
    // Only create tick if in viewport
    if (!isInViewport(position)) {
        return null;
    }

    // Get tick element and calculate color
    const hitErrorAbs = Math.abs(hitError);
    const tick = tickPool.get();
    
    // Set position directly
    setTickPosition(tick, hitError);
    
    // Set tick color based on timing windows and gamemode
    let tickClass = 'tick';
    
    if (gamemode === 'mania') {
        if (hitErrorAbs <= timingWindows['300g']) {
            tickClass += ' marvelous';
        } else if (hitErrorAbs <= timingWindows[300]) {
            tickClass += ' perfect';
        } else if (hitErrorAbs <= timingWindows[200]) {
            tickClass += ' great';
        } else if (hitErrorAbs <= timingWindows[100]) {
            tickClass += ' good';
        } else if (hitErrorAbs <= timingWindows[50]) {
            tickClass += ' bad';
        } else {
            tickClass += ' miss';
        }
    } else {
        // Standard, Taiko, Fruits
        if (hitErrorAbs <= timingWindows[300]) {
            tickClass += ' perfect';
        } else if (hitErrorAbs <= timingWindows[100]) {
            tickClass += ' good';
        } else if (hitErrorAbs <= timingWindows[50]) {
            tickClass += ' bad';
        } else {
            tickClass += ' miss';
        }
    }
    
    tick.className = tickClass;
    
    // Add to container and track
    if (elements.tickContainer) {
        elements.tickContainer.appendChild(tick);
        activeTicks.set(Date.now(), tick);
        
        // Run cleanup
        cleanupTicks();
    }
    
    return tick;
};

// Cleanup function
export const cleanup = () => {
    // Clear all active ticks
    for (const tick of activeTicks.values()) {
        if (tick.parentNode === elements.tickContainer) {
            elements.tickContainer.removeChild(tick);
            tickPool.release(tick);
        }
    }
    activeTicks.clear();
    
    // Clear tick pool
    tickPool.pool.length = 0;
    tickPool.index = 0;
    tickPool.initialized = false;
};

// Export tick pool operations
export { tickPool };

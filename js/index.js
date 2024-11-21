import WebSocketManager from "./socket.js";
import { updateSettings } from "./settings.js";
import { elements } from "./elements.js";
import { updateTimingWindows } from "./timingWindows.js";
import { createTick } from "./ticks.js";
import { getArrowColor } from "./elements.js";

const DEFAULT_HOST = "127.0.0.1:24050";
const socket = new WebSocketManager(DEFAULT_HOST);
let currentHost = DEFAULT_HOST;
let state = 0;
let mode = '';
let od = 0;
let ur = 0;

// Track local hit error history
const MAX_HIT_ERRORS = 50;
const hitErrorRing = new Array(MAX_HIT_ERRORS).fill(0);
let hitErrorIndex = 0;
let hitErrorCount = 0;
let lastHitErrorCount = 0;
let mods = [];

// Store timeouts for cleanup
const timeouts = new Set();

// Timing window cache
const timingWindowCache = new Map();
const getCacheKey = (hitError, mode, od, mods) => `${mode}-${od}-${mods}-${Math.round(hitError)}`;

// Helper function to create managed timeout
const createTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
        callback();
        timeouts.delete(timeoutId);
    }, delay);
    timeouts.add(timeoutId);
    return timeoutId;
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Animation functions
const updateArrowPosition = (targetPosition, targetColor) => {
    const arrow = elements.arrow;
    if (!arrow) return;
    
    arrow.style.transform = `translateX(${targetPosition}px)`;
    arrow.style.borderTopColor = targetColor;
};

const createTickWithAnimation = (hitError, mode, od, mods) => {
    requestAnimationFrame(() => {
        const cacheKey = getCacheKey(hitError, mode, od, mods);
        let tickConfig = timingWindowCache.get(cacheKey);
        
        if (!tickConfig) {
            tickConfig = createTick(hitError, mode, od, mods);
            if (tickConfig) {
                timingWindowCache.set(cacheKey, tickConfig);
            }
        } else {
            createTick(hitError, mode, od, mods, tickConfig);
        }
    });
};

// Initialize calculation worker
const calculationWorker = new Worker('./js/calculationWorker.js');

// Handle worker messages
calculationWorker.onmessage = (e) => {
    const { type, data } = e.data;
    if (type === 'statistics') {
        const { average, standardDeviation } = data;
        
        // Update UI with calculated values
        requestAnimationFrame(() => {
            if (elements.sd) {
                elements.sd.textContent = standardDeviation.toFixed(2);
            }
            
            const arrowColor = getArrowColor(average);
            updateArrowPosition(average * 2.5, arrowColor);
        });
    }
};

// Optimized average calculation
const calculateRingAverage = () => {
    const count = Math.min(hitErrorCount, MAX_HIT_ERRORS);
    if (count === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += hitErrorRing[i];
    }
    return sum / count;
};

// Optimized standard deviation calculation
const calculateSD = () => {
    if (!elements.sd || hitErrorCount === 0) return;
    
    const count = Math.min(hitErrorCount, MAX_HIT_ERRORS);
    const mean = calculateRingAverage();
    let variance = 0;
    
    for (let i = 0; i < count; i++) {
        variance += Math.pow(hitErrorRing[i] - mean, 2);
    }
    
    const standardDeviation = Math.sqrt(variance / count);
    elements.sd.textContent = standardDeviation.toFixed(2);
};

// Calculate average with arrow update
const calculateAverage = () => {
    if (hitErrorCount === 0) return;
    
    const avgError = calculateRingAverage();
    const arrowColor = getArrowColor(avgError);
    const targetPosition = avgError * 2.5;
    updateArrowPosition(targetPosition, arrowColor);
};

// Debounced versions of calculations
const debouncedCalculateSD = debounce(calculateSD, 50);
const debouncedCalculateAverage = debounce(calculateAverage, 50);

// Cleanup function
const cleanup = () => {
    // Clear timeouts
    timeouts.forEach(id => clearTimeout(id));
    timeouts.clear();
    
    // Reset state
    hitErrorRing.fill(0);
    hitErrorIndex = 0;
    hitErrorCount = 0;
    lastHitErrorCount = 0;
};

// Reset function
const reset = () => {
    cleanup();
    
    // Reset worker
    calculationWorker.postMessage({ type: 'reset' });
    
    // Reset UI
    if (elements.sd) {
        elements.sd.textContent = '0.00';
    }
    updateArrowPosition(0, getArrowColor(0));
};

// Initialize WebSocket connection
socket.sendCommand('getSettings', encodeURI(window.COUNTER_PATH));

socket.commands((data) => {
    try {
        const { command, message } = data;
        console.log('[WEBSOCKET] Received command:', command, 'with data:', message);
        if (command === 'getSettings') {
            if (message.error) {
                console.error('[SETTINGS] Error:', message.error);
                return;
            }
            
            const newHost = message?.websocketUrl;
            if (newHost && newHost !== currentHost) {
                currentHost = newHost;
                socket.close();
                socket = new WebSocketManager(currentHost);
            }

            // Update settings with received values
            updateSettings(message);
        } else if (command === 'updateSettings') {
            // Also handle updateSettings command
            updateSettings(message);
            // Clear timing window cache when settings change
            timingWindowCache.clear();
        }
    } catch (error) {
        console.error('[MESSAGE_ERROR] Error processing WebSocket message:', error);
    }
});

// Handle game state and menu updates
socket.api_v2((data) => {
    try {
        // Update state visibility
        if (state !== data.state.number) {
            state = data.state.number;
            // Show elements during editing (2)
            if (state === 2) {
                elements.allDivs?.forEach(div => div.classList.remove('hidden'));
            } else {
                elements.allDivs?.forEach(div => div.classList.add('hidden'));
                reset();
            }
        }
        
        if (ur !== data.play.unstableRate) {
            ur = data.play.unstableRate;
            if (ur === 0) {
                reset();
            }
        }

        // Update gamemode and OD
        const modeChanged = mode !== data.beatmap.mode.name;
        const odChanged = od !== data.beatmap.stats.od.original;
        const modsChanged = mods !== data.play.mods.name;

        if (modeChanged || odChanged || modsChanged) {
            mode = data.beatmap.mode.name;
            od = data.beatmap.stats.od.original;
            mods = data.play.mods.name;
            // Clear timing window cache when parameters change
            timingWindowCache.clear();
            // Update timing windows
            updateTimingWindows(mode, od, mods);
        }
    } catch (error) {
        console.error('[MESSAGE_ERROR] Error processing WebSocket message:', error);
    }
});

// Handle hit error updates
socket.api_v2_precise(async (data) => {
    try {
        const hits = data.hitErrors ?? [];
        
        // Only process new hit errors
        if (hits.length > lastHitErrorCount) {
            // Get all new hits
            const newHits = hits.slice(lastHitErrorCount);
            lastHitErrorCount = hits.length;
            
            // Process new hits
            for (const hit of newHits) {
                // Create tick and wait for timing windows
                await createTick(hit, mode, od, mods);
                
                // Send hit to worker for calculation
                calculationWorker.postMessage({
                    type: 'addHitError',
                    data: { hitError: hit }
                });
            }
        }
    } catch (error) {
        console.error('[MESSAGE_ERROR] Error processing WebSocket message:', error);
    }
});

// Cleanup on page unload
window.addEventListener('unload', cleanup);

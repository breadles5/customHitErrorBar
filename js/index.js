import WebSocketManager from "./socket.js";
import { updateSettings } from "./settings.js";
import { elements } from "./elements.js";
import { updateTimingWindows } from "./timingWindows.js";
import { createTick } from "./ticks.js";
import { average, getArrowColor } from "./elements.js";

const DEFAULT_HOST = "127.0.0.1:24050";
const socket = new WebSocketManager(DEFAULT_HOST);
let currentHost = DEFAULT_HOST;
let state = 0;
let mode = '';
let od = 0;
let ur = 0;

// Track local hit error history
let localHitErrors = [];
let lastHitErrorCount = 0;
let mods = [];

const reset = () => {
    lastHitErrorCount = 0;
    localHitErrors = [];
    // Reset standard deviation display
    if (elements.sd) {
        elements.sd.textContent = '0.00';
    }
    // Reset arrow position
    if (elements.arrow) {
        elements.arrow.style.transform = 'translateX(0px)';
        elements.arrow.style.color = 'var(--arrow-perfect)';
    }
    // Clear existing ticks
    const tickContainer = document.querySelector('.tick-container');
    if (tickContainer) {
        const ticks = tickContainer.querySelectorAll('.tick');
        ticks.forEach(tick => tick.remove());
    }
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
                // Reset arrays when UR is 0 (new play started)
            } else {
                elements.allDivs?.forEach(div => div.classList.add('hidden'));
                reset();
            }
        }
        
        if (ur !== data.play.unstableRate) {
            ur = data.play.unstableRate;
            if (ur  === 0) {
                reset();
            }
        }

        // Update gamemode and OD
        if (mode !== data.beatmap.mode.name) {
            mode = data.beatmap.mode.name;
            // Update timing windows when gamemode changes
            updateTimingWindows(mode, od, mods);
        }

        if (od !== data.beatmap.stats.od.original) {
            od = data.beatmap.stats.od.original;
            // Update timing windows when OD changes
            updateTimingWindows(mode, od, mods);
        }
        if (mods !== data.play.mods.name) {
            mods = data.play.mods.name;
            // Update timing windows when mods change
            updateTimingWindows(mode, od, mods);
        }
    } catch (error) {
        console.error('[MESSAGE_ERROR] Error processing WebSocket message:', error);
    }
});

// Handle hit error updates
socket.api_v2_precise((data) => {
    try {
        const hits = data.hitErrors ?? [];
        
        // Only process new hit errors
        if (hits.length > lastHitErrorCount) {
            // Get all new hits
            const newHits = hits.slice(lastHitErrorCount);
            lastHitErrorCount = hits.length;
            
            // Create ticks for new hits
            newHits.forEach(hit => createTick(hit, mode, od, mods));
            
            // Update local hit error history
            localHitErrors.push(...newHits);
            if (localHitErrors.length > 50) {
                localHitErrors = localHitErrors.slice(-50);
            }

            // Update arrow position based on average hit error
            const avgError = average(newHits);
            if (elements.arrow) {
                const arrowColor = getArrowColor(avgError);
                elements.arrow.style.borderTopColor = arrowColor;
                elements.arrow.style.transform = `translateX(${avgError * 2.5}px)`;
            }
            // Calculate and display standard deviation
            if (elements.sd && localHitErrors.length > 0) {
                const mean = average(localHitErrors);
                const variance = localHitErrors.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / localHitErrors.length;
                const standardDeviation = Math.sqrt(variance);
                elements.sd.textContent = standardDeviation.toFixed(2);
            }
        }
    } catch (error) {
        console.error('[MESSAGE_ERROR] Error processing WebSocket message:', error);
    }
});

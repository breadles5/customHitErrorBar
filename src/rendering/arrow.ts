import { getElement } from "../rendering/elements";
import { settings } from "../sockets/settings";

// Cache DOM element and settings
const arrow = getElement(".arrow");

const getArrowColor = (average: number): string => {
    const absError = Math.abs(average);
    if (absError <= settings.perfectArrowThreshold) {
        return "var(--arrow-perfect)";
    }
    if (average < 0) {
        return "var(--arrow-early)";
    }
    return "var(--arrow-late)";
};

let oldPosition = 0;
let pendingPosition: number | null = null;
let rAF: number | null = null;

export const updateArrow = (targetPosition: number): void => {
    pendingPosition = targetPosition;

    if (rAF === null) {
        rAF = requestAnimationFrame(() => {
            if (pendingPosition !== null && pendingPosition !== oldPosition) {
                oldPosition = pendingPosition;
                if (arrow) {
                    arrow.style.borderTopColor = getArrowColor(oldPosition);
                    arrow.style.transform = `translate3d(${oldPosition * 2}px, 0px, 0px)`;
                }
            }
            rAF = null;
            pendingPosition = null;
        });
    }
};

export function resetArrow() {
    // Cancel any pending update
    if (rAF !== null) {
        cancelAnimationFrame(rAF);
        rAF = null;
        pendingPosition = null;
    }

    requestAnimationFrame(() => {
        oldPosition = 0;
        if (arrow) {
            arrow.style.borderTopColor = "#fff";
            arrow.style.transform = "translate3d(0px, 0px, 0px)";
        }
    });
}

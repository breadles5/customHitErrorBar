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
export const updateArrow = (targetPosition: number): void => {
    requestAnimationFrame(() => {
        if (targetPosition === oldPosition) {
            return;
        }
        oldPosition = targetPosition;
        // console.log(`moved from ${oldPosition} to ${targetPosition}`);
        if (arrow) {
            arrow.style.borderTopColor = getArrowColor(targetPosition);
            arrow.style.transform = `translate3d(${targetPosition * 2}px, 0px, 0px)`;
        }
    });
};

export function resetArrow() {
    requestAnimationFrame(() => {
        oldPosition = 0;
        if (arrow) {
            arrow.style.borderTopColor = "#fff";
            arrow.style.transform = "translate3d(0px, 0px, 0px)";
        }
    });
}

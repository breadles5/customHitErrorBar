import { getElement } from "../rendering/elements";
import { settings } from "../sockets/settings";

// Animation functions
const arrow = getElement(".arrow");
const disableHardwareAcceleration = settings.disableHardwareAcceleration
const perfectArrowThreshold = settings.perfectArrowThreshold;

const getArrowColor = (average: number): string => {
    const absError = Math.abs(average);
    const threshold = perfectArrowThreshold;
    if (absError <= threshold) {
        return "var(--arrow-perfect)";
    }
    if (average < 0) {
        return "var(--arrow-early)";
    }
    return "var(--arrow-late)";
};

export const updateArrow = (targetPosition: number): void => {
    if (arrow) {
        // conditionally use hardware accelerated transform
        if (disableHardwareAcceleration) {
            arrow.style.transform = `translateX(${targetPosition * 2}px)`;
            return;
        };
        arrow.style.transform = `translate3d(${targetPosition * 2}px, 0px, 0px)`;
        arrow.style.borderTopColor = getArrowColor(targetPosition);
    }
}

export function resetArrow() {
    if (arrow) {
        arrow.style.borderTopColor = "#fff";
        if (disableHardwareAcceleration) {
            arrow.style.transform = "translateX(0px)";
            return;
        };
        arrow.style.transform = "translate3d(0px, 0px, 0px)";
    }
}

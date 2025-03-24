import { getElement } from "../rendering/elements";
import { settings } from "../sockets/settings";

// Animation functions
const getArrowColor = (average: number): string => {
    const absError = Math.abs(average);
    const threshold = settings.perfectArrowThreshold;
    if (absError <= threshold) {
        return "var(--arrow-perfect)";
    }
    if (average < 0) {
        return "var(--arrow-early)";
    }
    return "var(--arrow-late)";
};

export function updateArrow(targetPosition: number) {
    const arrow = getElement(".arrow");
    if (arrow) {
        // should allow for gpu acceleration?
        arrow.style.transform = `translate3d(${targetPosition * 2}px, 0, 0)`;
        arrow.style.borderTopColor = getArrowColor(targetPosition);
    }
}

export function resetArrow() {
    const arrow = getElement(".arrow");
    if (arrow) {
        arrow.style.transform = "translateX(0px)";
        arrow.style.borderTopColor = "#fff";
    }
}

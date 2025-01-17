import { elements } from "./elements";
import { settings } from "./settings";

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
    if (elements.arrow) {
        elements.arrow.style.transform = `translateX(${targetPosition}px)`;
        elements.arrow.style.borderTopColor = getArrowColor(targetPosition);
    }
}

export function resetArrow() {
    if (elements.arrow) {
        elements.arrow.style.transform = "translateX(0px)";
        elements.arrow.style.borderTopColor = "#fff";
    }
}

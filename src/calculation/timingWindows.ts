const calculateOsuWindows = (od: number, mods: string): Map<string, number> => {
    const windows = new Map<string, number>();
    if (mods.includes("EZ")) {
        const modifiedOd = od / 2;
        windows.set("300", 50 - 3 * modifiedOd);
        windows.set("100", 140 - 8 * modifiedOd);
        windows.set("50", 200 - 10 * modifiedOd);
    } else if (mods.includes("HR")) {
        const modifiedOd = Math.min(od * 1.4, 10);
        windows.set("300", 50 - 3 * modifiedOd);
        windows.set("100", 140 - 8 * modifiedOd);
        windows.set("50", 200 - 10 * modifiedOd);
    } else {
        windows.set("300", 80 - 6 * od);
        windows.set("100", 140 - 8 * od);
        windows.set("50", 200 - 10 * od);
    }
    return windows;
};

const calculateTaikoWindows = (od: number, mods: string): Map<string, number> => {
    const windows = new Map<string, number>();
    if (mods.includes("EZ")) {
        const modifiedOd = od / 2;
        windows.set("300", 50 - 3 * modifiedOd);
        if (od >= 5) {
            windows.set("100", 119.5 - 8 * modifiedOd);
            windows.set("50", 135 - 8 * modifiedOd);
        } else {
            windows.set("100", 110 - 6 * modifiedOd);
            windows.set("50", 120 - 5 * modifiedOd);
        }
    } else if (mods.includes("HR")) {
        const modifiedOd = Math.min(od * 1.4, 10);
        windows.set("300", 50 - 3 * modifiedOd);
        if (modifiedOd >= 5) {
            windows.set("100", 119.5 - 8 * modifiedOd);
            windows.set("50", 135 - 8 * modifiedOd);
        } else {
            windows.set("100", 110 - 6 * modifiedOd);
            windows.set("50", 120 - 5 * modifiedOd);
        }
    } else {
        windows.set("300", 50 - 3 * od);
        if (od >= 5) {
            windows.set("100", 119.5 - 8 * od);
            windows.set("50", 135 - 8 * od);
        } else {
            windows.set("100", 110 - 6 * od);
            windows.set("50", 120 - 5 * od);
        }
    }
    return windows;
};

const calculateManiaWindows = (od: number, mods: string, rate: number): Map<string, number> => {
    const windows = new Map<string, number>();
    if (mods.includes("EZ")) {
        const modifiedOd = od * 0.5;
        windows.set("300g", 22.5 * rate);
        windows.set("300", (64 - 3 * modifiedOd) * rate);
        windows.set("200", (97 - 3 * modifiedOd) * rate);
        windows.set("100", (127 - 3 * modifiedOd) * rate);
        windows.set("50", (151 - 3 * modifiedOd) * rate);
    } else if (mods.includes("HR")) {
        const hrMultiplier = 5 / 7; // Official multiplier is exactly 5/7 (approx 0.714)
        windows.set("300g", 11.43 * rate);
        windows.set("300", (64 - 3 * od) * hrMultiplier * rate);
        windows.set("200", (97 - 3 * od) * hrMultiplier * rate);
        windows.set("100", (127 - 3 * od) * hrMultiplier * rate);
        windows.set("50", (151 - 3 * od) * hrMultiplier * rate);
    } else {
        windows.set("300g", 16.5 * rate);
        windows.set("300", (64 - 3 * od) * rate);
        windows.set("200", (97 - 3 * od) * rate);
        windows.set("100", (127 - 3 * od) * rate);
        windows.set("50", (151 - 3 * od) * rate);
    }
    return windows;
};

export const calculateTimingWindows = (
    gamemode: string,
    od: number,
    mods: string,
    rate: number,
    customTimingWindows?: string,
): Map<string, number> => {
    if (customTimingWindows) {
        const values = customTimingWindows.split(",").map((v) => Number.parseFloat(v.trim()));
        const windows = new Map<string, number>();
        if (gamemode === "mania") {
            const grades = ["300g", "300", "200", "100", "50"];
            grades.forEach((grade, idx) => {
                if (idx < values.length) {
                    windows.set(grade, values[idx]);
                }
            });
        } else {
            const grades = ["300", "100", "50"];
            grades.forEach((grade, idx) => {
                if (idx < values.length) {
                    windows.set(grade, values[idx]);
                }
            });
        }
        return windows;
    }

    // Calculate timing windows based on gamemode
    switch (gamemode) {
        case "osu":
            return calculateOsuWindows(od, mods);
        case "fruits":
            console.warn("timing windows for fruits is not applicable");
            return new Map<string, number>();
        case "taiko":
            return calculateTaikoWindows(od, mods);
        case "mania":
            return calculateManiaWindows(od, mods, rate);
        default:
            console.warn("no gamemode detected, returning no windows");
            return new Map<string, number>();
    }
};

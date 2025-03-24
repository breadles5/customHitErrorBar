// Calculate timing windows based on gamemode and OD
export const calculateModTimingWindows = (gamemode: string, od: number, mods: string): Map<string, number> => {
    let modifiedOD = od;

    // TODO: implement V2 mod, refer to osu wiki.
    /* 
        note: v2 mod modifies how od is used in the timing window calculation 
        so we may have to implment a new function for calculating timing windows
        that takes into account v2 mod
        which also means we need to provide another switch case for v2 mod

        edit (9/1/2025): shit, kinda forgot that scorev2 is native to lazer, but is a mod in stable
        now we might have to take into account the client type
    */
    // if (mods.includes("V2") /*|| client === "Lazer"*/) {
    //     switch (true) {
    //         case mods.includes("HR"):
    //             modifiedOD = Math.min(modifiedOD * 1.4, 10);
    //             return calculateV2ModeWindows(gamemode, modifiedOD, mods);
    //         case mods.includes("EZ"):
    //             modifiedOD *= 0.5;
    //             return calculateV2ModeWindows(gamemode, modifiedOD, mods);
    //         default:
    //             return calculateV2ModeWindows(gamemode, modifiedOD, mods);
    //     }
    // }
    switch (true) {
        case mods.includes("HR"):
            modifiedOD = Math.min(modifiedOD * 1.4, 10);
            return calculateGameModeWindows(gamemode, modifiedOD, mods);
        case mods.includes("EZ"):
            modifiedOD *= 0.5;
            return calculateGameModeWindows(gamemode, modifiedOD, mods);
        default:
            return calculateGameModeWindows(gamemode, modifiedOD, mods);
    }
};

// Calculate windows for specific gamemode
const calculateGameModeWindows = (gamemode: string, od: number, mods: string): Map<string, number> => {
    const windows = new Map<string, number>();
    switch (gamemode) {
        case "osu":
            windows.set("300", 80 - 6 * od);
            windows.set("100", 140 - 8 * od);
            windows.set("50", 200 - 10 * od);
            windows.set("0", 400);
            break;
        case "taiko":
            if (od <= 5) {
                windows.set("300", 50 - 3 * od);
                windows.set("100", 120 - 8 * od);
                windows.set("0", 135 - 8 * od);
            } else {
                windows.set("300", 50 - 3 * od);
                windows.set("100", 110 - 6 * od);
                windows.set("0", 120 - 5 * od);
            }
            break;
        case "fruits":
            windows.set("300", 80 - 6 * od);
            windows.set("100", 140 - 8 * od);
            windows.set("50", 200 - 10 * od);
            break;
        case "mania":
            windows.set("300g", mods.includes("EZ") ? 22.5 : mods.includes("HR") ? 11.43 : 16.5);
            windows.set("300", mods.includes("HR") ? (64 - 3 * od) / 1.4 : 64 - 3 * od);
            windows.set("200", mods.includes("HR") ? (97 - 3 * od) / 1.4 : 97 - 3 * od);
            windows.set("100", mods.includes("HR") ? (127 - 3 * od) / 1.4 : 127 - 3 * od);
            windows.set("50", mods.includes("HR") ? (151 - 3 * od) / 1.4 : 151 - 3 * od);
            windows.set("0", mods.includes("HR") ? (188 - 3 * od) / 1.4 : 188 - 3 * od);
            break;
        default:
            console.warn(`Unknown gamemode: ${gamemode}, falling back to osu standard`);
            windows.set("300", 80 - 6 * od);
            windows.set("100", 140 - 8 * od);
            windows.set("50", 200 - 10 * od);
            break;
    }
    return windows;
};

// const calculateV2ModeWindows = (gamemode: string, od: number, mods: string): { [key: string]: number } => {
//     switch (gamemode) {
//         case "osu":
//             return {
//                 300: 80 - 6 * od,
//                 100: 140 - 8 * od,
//                 50: 200 - 10 * od,
//                 0: 400,
//             };

//         case "taiko":
//             if (od <= 5) {
//                 return {
//                     300: 50 - 3 * od,
//                     100: 120 - 8 * od,
//                     0: 135 - 8 * od,
//                 };
//             }
//             return {
//                 300: 50 - 3 * od,
//                 100: 110 - 6 * od,
//                 0: 120 - 5 * od,
//             };

//         case "fruits":
//             return {
//                 300: 80 - 6 * od,
//                 100: 140 - 8 * od,
//                 50: 200 - 10 * od,
//             };

//         case "mania":
//             return {
//                 "300g": mods.includes("EZ") ? 22.5 : mods.includes("HR") ? 11.43 : 16.5,
//                 300: mods.includes("HR") ? (64 - 3 * od) / 1.4 : 64 - 3 * od,
//                 200: mods.includes("HR") ? (97 - 3 * od) / 1.4 : 97 - 3 * od,
//                 100: mods.includes("HR") ? (127 - 3 * od) / 1.4 : 127 - 3 * od,
//                 50: mods.includes("HR") ? (151 - 3 * od) / 1.4 : 151 - 3 * od,
//                 0: mods.includes("HR") ? (188 - 3 * od) / 1.4 : 188 - 3 * od,
//             };

//         default:
//             console.warn(`Unknown gamemode: ${gamemode}, falling back to osu standard`);
//             return {
//                 300: 80 - 6 * od,
//                 100: 140 - 8 * od,
//                 50: 200 - 10 * od,
//             };
//     }
// };

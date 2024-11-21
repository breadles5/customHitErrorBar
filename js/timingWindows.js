// Calculate timing windows based on gamemode and OD
export const calculateTimingWindowsForGamemode = async (gamemode, od, mods) => {
  let modifiedOD = od;

  // Apply mod effects asynchronously
  await Promise.resolve(); // Yield to event loop

  switch (true) {
    case mods.includes("HR"):
      modifiedOD *= 1.4;
      if (modifiedOD > 10) {
        modifiedOD = 10;
      }
      return calculateModeWindows(gamemode, modifiedOD, mods);

    case mods.includes("EZ"):
      modifiedOD *= 0.5;
      return calculateModeWindows(gamemode, modifiedOD, mods);

    default:
      return calculateModeWindows(gamemode, modifiedOD, mods);
  }
};

// Calculate windows for specific gamemode
const calculateModeWindows = async (gamemode, od, mods = []) => {
  await Promise.resolve(); // Yield to event loop

  switch (gamemode) {
    case "osu":
      return {
        300: 80 - 6 * od,
        100: 140 - 8 * od,
        50: 200 - 10 * od,
        0: 400,
      };

    case "taiko":
      if (od <= 5) {
        return {
          300: 50 - 3 * od,
          100: 120 - 8 * od,
          0: 135 - 8 * od,
        };
      }
      return {
        300: 50 - 3 * od,
        100: 110 - 6 * od,
        0: 120 - 5 * od,
      };

    case "fruits":
      return {
        300: 80 - 6 * od,
        100: 140 - 8 * od,
        50: 200 - 10 * od,
      };

    case "mania":
      return {
        "300g": mods.includes("EZ") ? 22.5 : 11.43,
        300: mods.includes("HR") ? (64 - 3 * od) / 1.4 : 64 - 3 * od,
        200: mods.includes("HR") ? (97 - 3 * od) / 1.4 : 97 - 3 * od,
        100: mods.includes("HR") ? (127 - 3 * od) / 1.4 : 127 - 3 * od,
        50: mods.includes("HR") ? (151 - 3 * od) / 1.4 : 151 - 3 * od,
        0: mods.includes("HR") ? (188 - 3 * od) / 1.4 : 188 - 3 * od,
      };

    default:
      console.warn(
        `Unknown gamemode: ${gamemode}, falling back to osu standard`,
      );
      return {
        300: 80 - 6 * od,
        100: 140 - 8 * od,
        50: 200 - 10 * od,
      };
  }
};

// Update timing window display in the DOM
export const updateTimingWindows = async (gamemode, od, mods) => {
  const timingWindows = await calculateTimingWindowsForGamemode(
    gamemode,
    od,
    mods,
  );
  const colorsContainer = document.querySelector(".colors-container");
  console.log("Timing windows:", timingWindows);

  // Clear existing timing windows
  if (colorsContainer) {
    colorsContainer.innerHTML = "";
  }

  // Round each item of timingWindows to 2 digits
  Object.keys(timingWindows).forEach((grade) => {
    timingWindows[grade] = timingWindows[grade].toFixed(2);
  });

  // Set container widths based on miss window (0)
  const containerWidth = Math.abs(timingWindows[0] * 5);
  document.documentElement.style.setProperty(
    "--container-width",
    `${containerWidth}px`,
  );

  // Helper function to create timing window element
  const createTimingWindow = (grade, width) => {
    const div = document.createElement("div");
    div.className = `timing-window-${grade}`;
    div.style.width = `${Math.abs(width * 5)}px`;
    return div;
  };

  // Add timing windows based on gamemode
  if (gamemode === "mania") {
    // Mania-specific windows
    if (timingWindows["300g"]) {
      colorsContainer.appendChild(
        createTimingWindow("300g", timingWindows["300g"]),
      );
    }
    if (timingWindows[300]) {
      colorsContainer.appendChild(
        createTimingWindow("300", timingWindows[300]),
      );
    }
    if (timingWindows[200]) {
      colorsContainer.appendChild(
        createTimingWindow("200", timingWindows[200]),
      );
    }
    if (timingWindows[100]) {
      colorsContainer.appendChild(
        createTimingWindow("100", timingWindows[100]),
      );
    }
    if (timingWindows[50]) {
      colorsContainer.appendChild(createTimingWindow("50", timingWindows[50]));
    }
    if (timingWindows[0]) {
      colorsContainer.appendChild(createTimingWindow("0", timingWindows[0]));
    }
  } else {
    // Standard, Taiko, Fruits windows
    if (timingWindows[300]) {
      colorsContainer.appendChild(
        createTimingWindow("300", timingWindows[300]),
      );
    }
    if (timingWindows[100]) {
      colorsContainer.appendChild(
        createTimingWindow("100", timingWindows[100]),
      );
    }
    if (timingWindows[50]) {
      colorsContainer.appendChild(createTimingWindow("50", timingWindows[50]));
    }
    if (timingWindows[0]) {
      colorsContainer.appendChild(createTimingWindow("0", timingWindows[0]));
    }
  }
};

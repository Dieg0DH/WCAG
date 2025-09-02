class ColorBlindnessSimulator {
  constructor(paletteManager) {
    this.paletteManager = paletteManager;
    this.setupEventListeners();
    this.updateSimulator();
  }

  setupEventListeners() {
    document.getElementById("colorblindType").addEventListener("change", () => {
      this.updateSimulator();
    });

    document
      .getElementById("exportJsonBtn")
      .addEventListener("click", () => this.exportAsJSON());
    document
      .getElementById("copyAllBtn")
      .addEventListener("click", () => this.copyAllHexCodes());
  }

  simulateColorBlindness(hex, type) {
    const rgb = ColorUtils.hexToRgb(hex);
    let simulated = { ...rgb };

    switch (type) {
      case "protanopia":
        simulated.r = 0.567 * rgb.r + 0.433 * rgb.g;
        simulated.g = 0.558 * rgb.r + 0.442 * rgb.g;
        simulated.b = 0.242 * rgb.g + 0.758 * rgb.b;
        break;
      case "deuteranopia":
        simulated.r = 0.625 * rgb.r + 0.375 * rgb.g;
        simulated.g = 0.7 * rgb.r + 0.3 * rgb.g;
        simulated.b = 0.3 * rgb.g + 0.7 * rgb.b;
        break;
      case "tritanopia":
        simulated.r = 0.95 * rgb.r + 0.05 * rgb.g;
        simulated.g = 0.433 * rgb.g + 0.567 * rgb.b;
        simulated.b = 0.475 * rgb.g + 0.525 * rgb.b;
        break;
      case "achromatopsia":
        const gray = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
        simulated = { r: gray, g: gray, b: gray };
        break;
    }

    return ColorUtils.rgbToHex(
      Math.round(Math.min(255, Math.max(0, simulated.r))),
      Math.round(Math.min(255, Math.max(0, simulated.g))),
      Math.round(Math.min(255, Math.max(0, simulated.b)))
    );
  }

  updateSimulator() {
    const simulatorType = document.getElementById("colorblindType").value;
    const simulatedContainer = document.getElementById("simulatedPalette");
    simulatedContainer.innerHTML = "";

    const colors = this.paletteManager.getColors();
    colors.forEach((color) => {
      const simulatedColor =
        simulatorType === "normal"
          ? color
          : this.simulateColorBlindness(color, simulatorType);

      const colorDiv = document.createElement("div");
      colorDiv.className = "simulated-color";
      colorDiv.style.backgroundColor = simulatedColor;
      colorDiv.title = simulatedColor.toUpperCase();
      simulatedContainer.appendChild(colorDiv);
    });
  }

  copyAllHexCodes() {
    const colors = this.paletteManager.getColors();
    const hexCodes = colors.map((color) => color.toUpperCase()).join("\n");
    navigator.clipboard
      .writeText(hexCodes)
      .then(() => {
        ColorUtils.showNotification("All colors copied!");
      })
      .catch((err) => {
        alert("Failed to copy to clipboard");
      });
  }

  generateContrastPairs() {
    const colors = this.paletteManager.getColors();
    const pairs = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = ColorUtils.getContrastRatio(colors[i], colors[j]);
        pairs.push({
          color1: colors[i].toUpperCase(),
          color2: colors[j].toUpperCase(),
          contrastRatio: ratio.toFixed(2),
          wcagAA: ratio >= 4.5,
          wcagAAA: ratio >= 7,
        });
      }
    }
    return pairs;
  }

  exportAsJSON() {
    const colors = this.paletteManager.getColors();
    const paletteData = {
      name: "WCAG Color Palette",
      created: new Date().toISOString(),
      colors: colors.map((color, index) => ({
        id: index + 1,
        hex: color.toUpperCase(),
        rgb: ColorUtils.hexToRgb(color),
      })),
      contrastPairs: this.generateContrastPairs(),
    };

    const jsonString = JSON.stringify(paletteData, null, 2);
    const exportResult = document.getElementById("exportResult");
    exportResult.textContent = jsonString;
    exportResult.classList.add("show");

    // Also download the file
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wcag-color-palette.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

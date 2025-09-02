const ColorUtils = {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  getLuminance(rgb) {
    const rgRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r =
      rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g =
      gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b =
      bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  getContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  generateRandomColor() {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  },

  // Color blindness

  simulateColorBlindness(hex, type) {
    const rgb = this.hexToRgb(hex);
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

    return this.rgbToHex(
      Math.round(Math.min(255, Math.max(0, simulated.r))),
      Math.round(Math.min(255, Math.max(0, simulated.g))),
      Math.round(Math.min(255, Math.max(0, simulated.b)))
    );
  },
};

// Main app

class ColorPaletteApp {
  constructor() {
    this.colors = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#8b5cf6"];
    this.currentEditingIndex = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderPalette();
    this.updateContrastChecker();
    this.updateColorBlindnessSimulator();
  }

  setupEventListeners() {
    document
      .getElementById("addColorBtn")
      .addEventListener("click", () => this.addColor());
    document
      .getElementById("generatePaletteBtn")
      .addEventListener("click", () => this.generateRandomPalette());

    // Contrast checker
    document
      .getElementById("foregroundColor")
      .addEventListener("input", (e) => {
        document.getElementById("foregroundHex").value = e.target.value;
        this.updateContrastChecker();
      });

    document
      .getElementById("backgroundColor")
      .addEventListener("input", (e) => {
        document.getElementById("backgroundHex").value = e.target.value;
        this.updateContrastChecker();
      });

    document.getElementById("foregroundHex").addEventListener("input", (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        document.getElementById("foregroundColor").value = e.target.value;
        this.updateContrastChecker();
      }
    });

    document.getElementById("backgroundHex").addEventListener("input", (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        document.getElementById("backgroundColor").value = e.target.value;
        this.updateContrastChecker();
      }
    });

    // Color blindness
    document.getElementById("colorblindType").addEventListener("change", () => {
      this.updateColorBlindnessSimulator();
    });

    // Export controls
    document
      .getElementById("exportJsonBtn")
      .addEventListener("click", () => this.exportPaletteAsJson());
    document
      .getElementById("copyAllBtn")
      .addEventListener("click", () => this.copyAllHexCodes());
  }
}

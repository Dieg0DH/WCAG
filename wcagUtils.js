// Color manipulation utilities
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
    const rsRGB = rgb.r / 255;
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

  // Color blindness simulation
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

// Main application
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
    // Palette controls
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

    // Color blindness simulator
    document.getElementById("colorblindType").addEventListener("change", () => {
      this.updateColorBlindnessSimulator();
    });

    // Export controls
    document
      .getElementById("exportJsonBtn")
      .addEventListener("click", () => this.exportAsJSON());
    document
      .getElementById("copyAllBtn")
      .addEventListener("click", () => this.copyAllHexCodes());

    // Modal controls
    const modal = document.getElementById("colorModal");
    const closeBtn = document.querySelector(".close");

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    document
      .getElementById("modalColorPicker")
      .addEventListener("input", (e) => {
        document.getElementById("modalHexInput").value = e.target.value;
      });

    document.getElementById("modalHexInput").addEventListener("input", (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        document.getElementById("modalColorPicker").value = e.target.value;
      }
    });

    document.getElementById("saveColorBtn").addEventListener("click", () => {
      this.saveEditedColor();
    });
  }

  renderPalette() {
    const paletteContainer = document.getElementById("colorPalette");
    paletteContainer.innerHTML = "";

    this.colors.forEach((color, index) => {
      const colorCard = document.createElement("div");
      colorCard.className = "color-card";

      const colorDisplay = document.createElement("div");
      colorDisplay.className = "color-display";
      colorDisplay.style.backgroundColor = color;

      const colorInfo = document.createElement("div");
      colorInfo.className = "color-info";

      const colorHex = document.createElement("div");
      colorHex.className = "color-hex";
      colorHex.textContent = color.toUpperCase();

      const colorActions = document.createElement("div");
      colorActions.className = "color-actions";

      // Event listeners
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => this.editColor(index));

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => this.copyHex(color));

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => this.removeColor(index));

      colorActions.appendChild(editBtn);
      colorActions.appendChild(copyBtn);
      colorActions.appendChild(removeBtn);

      colorInfo.appendChild(colorHex);
      colorInfo.appendChild(colorActions);

      colorCard.appendChild(colorDisplay);
      colorCard.appendChild(colorInfo);

      paletteContainer.appendChild(colorCard);
    });
  }

  addColor() {
    const newColor = ColorUtils.generateRandomColor();
    this.colors.push(newColor);
    this.renderPalette();
    this.updateColorBlindnessSimulator();
  }

  removeColor(index) {
    if (this.colors.length > 1) {
      this.colors.splice(index, 1);
      this.renderPalette();
      this.updateColorBlindnessSimulator();
    } else {
      alert("You must keep at least one color in the palette.");
    }
  }

  editColor(index) {
    this.currentEditingIndex = index;
    const modal = document.getElementById("colorModal");
    const color = this.colors[index];

    document.getElementById("modalColorPicker").value = color;
    document.getElementById("modalHexInput").value = color;

    modal.style.display = "block";
  }

  saveEditedColor() {
    if (this.currentEditingIndex !== null) {
      const newColor = document.getElementById("modalHexInput").value;
      if (/^#[0-9A-F]{6}$/i.test(newColor)) {
        this.colors[this.currentEditingIndex] = newColor;
        this.renderPalette();
        this.updateColorBlindnessSimulator();
        document.getElementById("colorModal").style.display = "none";
      } else {
        alert("Please enter a valid hex color code (e.g., #FF0000)");
      }
    }
  }

  generateRandomPalette() {
    this.colors = [];
    for (let i = 0; i < 5; i++) {
      this.colors.push(ColorUtils.generateRandomColor());
    }
    this.renderPalette();
    this.updateColorBlindnessSimulator();
  }

  updateContrastChecker() {
    const foreground = document.getElementById("foregroundColor").value;
    const background = document.getElementById("backgroundColor").value;

    const ratio = ColorUtils.getContrastRatio(foreground, background);
    const ratioDisplay = document.getElementById("contrastRatio");
    ratioDisplay.textContent = ratio.toFixed(2) + ":1";

    // WCAG tests
    const normalAA = document.getElementById("normalAA");
    normalAA.className = ratio >= 4.5 ? "status pass" : "status fail";
    normalAA.textContent = ratio >= 4.5 ? "✓ Pass" : "✗ Fail";

    const normalAAA = document.getElementById("normalAAA");
    normalAAA.className = ratio >= 7 ? "status pass" : "status fail";
    normalAAA.textContent = ratio >= 7 ? "✓ Pass" : "✗ Fail";

    const largeAA = document.getElementById("largeAA");
    largeAA.className = ratio >= 3 ? "status pass" : "status fail";
    largeAA.textContent = ratio >= 3 ? "✓ Pass" : "✗ Fail";

    const largeAAA = document.getElementById("largeAAA");
    largeAAA.className = ratio >= 4.5 ? "status pass" : "status fail";
    largeAAA.textContent = ratio >= 4.5 ? "✓ Pass" : "✗ Fail";

    // Update preview
    const previewBox = document.getElementById("previewBox");
    previewBox.style.backgroundColor = background;
    previewBox.style.color = foreground;
  }

  updateColorBlindnessSimulator() {
    const simulatorType = document.getElementById("colorblindType").value;
    const simulatedContainer = document.getElementById("simulatedPalette");
    simulatedContainer.innerHTML = "";

    this.colors.forEach((color) => {
      const simulatedColor =
        simulatorType === "normal"
          ? color
          : ColorUtils.simulateColorBlindness(color, simulatorType);

      const colorDiv = document.createElement("div");
      colorDiv.className = "simulated-color";
      colorDiv.style.backgroundColor = simulatedColor;
      colorDiv.title = simulatedColor.toUpperCase();
      simulatedContainer.appendChild(colorDiv);
    });
  }

  copyHex(hex) {
    navigator.clipboard
      .writeText(hex.toUpperCase())
      .then(() => {
        // Notification
        const notification = document.createElement("div");
        notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #16a34a;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
        notification.textContent = `Copied ${hex.toUpperCase()}!`;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.remove();
        }, 2000);
      })
      .catch((err) => {
        alert("Failed to copy to clipboard");
      });
  }

  copyAllHexCodes() {
    const hexCodes = this.colors.map((color) => color.toUpperCase()).join("\n");
    navigator.clipboard
      .writeText(hexCodes)
      .then(() => {
        const notification = document.createElement("div");
        notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #16a34a;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
        notification.textContent = "All colors copied!";
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.remove();
        }, 2000);
      })
      .catch((err) => {
        alert("Failed to copy to clipboard");
      });
  }

  exportAsJSON() {
    const paletteData = {
      name: "WCAG Color Palette",
      created: new Date().toISOString(),
      colors: this.colors.map((color, index) => ({
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

    // File download
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

  generateContrastPairs() {
    const pairs = [];
    for (let i = 0; i < this.colors.length; i++) {
      for (let j = i + 1; j < this.colors.length; j++) {
        const ratio = ColorUtils.getContrastRatio(
          this.colors[i],
          this.colors[j]
        );
        pairs.push({
          color1: this.colors[i].toUpperCase(),
          color2: this.colors[j].toUpperCase(),
          contrastRatio: ratio.toFixed(2),
          wcagAA: ratio >= 4.5,
          wcagAAA: ratio >= 7,
        });
      }
    }
    return pairs;
  }
}

// DOM
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new ColorPaletteApp();
});

// Message animation
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

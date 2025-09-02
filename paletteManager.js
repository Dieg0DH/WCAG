class PaletteManager {
  constructor() {
    this.colors = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#8b5cf6"];
    this.currentEditingIndex = null;
    this.onPaletteChange = null;
  }

  init() {
    this.setupEventListeners();
    this.renderPalette();
  }

  setupEventListeners() {
    document
      .getElementById("addColorBtn")
      .addEventListener("click", () => this.addColor());
    document
      .getElementById("generatePaletteBtn")
      .addEventListener("click", () => this.generateRandomPalette());

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

    // Update modules with palette change
    if (this.onPaletteChange) {
      this.onPaletteChange(this.colors);
    }
  }

  addColor() {
    const newColor = ColorUtils.generateRandomColor();
    this.colors.push(newColor);
    this.renderPalette();
  }

  removeColor(index) {
    if (this.colors.length > 1) {
      this.colors.splice(index, 1);
      this.renderPalette();
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
  }

  copyHex(hex) {
    navigator.clipboard
      .writeText(hex.toUpperCase())
      .then(() => {
        ColorUtils.showNotification(`Copied ${hex.toUpperCase()}!`);
      })
      .catch((err) => {
        alert("Failed to copy to clipboard");
      });
  }

  getColors() {
    return this.colors;
  }
}

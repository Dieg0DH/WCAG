class ContrastChecker {
  constructor() {
    this.setupEventListeners();
    this.updateContrastChecker();
  }

  setupEventListeners() {
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
}

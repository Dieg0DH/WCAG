// App initialization
document.addEventListener("DOMContentLoaded", () => {
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

  // Modules start
  const paletteManager = new PaletteManager();
  const contrastChecker = new ContrastChecker();
  const colorBlindnessSimulator = new ColorBlindnessSimulator(paletteManager);

  // Connect modules
  paletteManager.onPaletteChange = (colors) => {
    colorBlindnessSimulator.updateSimulator();
  };

  paletteManager.init();
});

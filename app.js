// App initialization
document.addEventListener("DOMContentLoaded", () => {
  // Modules start
  const paletteManager = new PaletteManager();
  const colorBlindnessSimulator = new ColorBlindnessSimulator(paletteManager);

  // Connect modules
  paletteManager.onPaletteChange = (colors) => {
    colorBlindnessSimulator.updateSimulator();
  };

  paletteManager.init();
});

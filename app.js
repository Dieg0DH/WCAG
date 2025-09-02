// App initialization
document.addEventListener("DOMContentLoaded", () => {
  const paletteManager = new PaletteManager();
  const contrastChecker = new ContrastChecker();
  const colorBlindnessSimulator = new ColorBlindnessSimulator(paletteManager);

  paletteManager.onPaletteChange = (colors) => {
    colorBlindnessSimulator.updateSimulator();
  };
  paletteManager.init();
});

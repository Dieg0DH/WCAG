class ThemeToggle {
  constructor() {
    this.theme = localStorage.getItem("theme") || "dark";
    this.init();
  }

  init() {
    // Default theme
    document.documentElement.setAttribute("data-theme", this.theme);

    // Event listener
    const toggleButton = document.getElementById("themeToggle");
    toggleButton.addEventListener("click", () => this.toggleTheme());

    // Keyboard support
    toggleButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            this.theme = e.matches ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", this.theme);
          }
        });
    }

    if (!localStorage.getItem("theme")) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        this.theme = "dark";
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.theme);
    localStorage.setItem("theme", this.theme);

    document.body.classList.add("theme-transitioning");
    setTimeout(() => {
      document.body.classList.remove("theme-transitioning");
    }, 300);

    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: this.theme },
      })
    );

    this.announceThemeChange();
  }

  announceThemeChange() {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.style.position = "absolute";
    announcement.style.left = "-10000px";
    announcement.style.width = "1px";
    announcement.style.height = "1px";
    announcement.style.overflow = "hidden";
    announcement.textContent = `Switched to ${this.theme} mode`;

    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  getTheme() {
    return this.theme;
  }

  setTheme(theme) {
    if (theme === "light" || theme === "dark") {
      this.theme = theme;
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }
}

// Start theme toggle
const themeToggle = new ThemeToggle();

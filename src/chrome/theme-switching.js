
// Listen for DevTools theme changes, and toggle Bootstrap's dark mode attribute.
// Works in Firefox DevTools panel extensions.

(function () {
  /**
   * Set the Bootstrap theme attribute based on the DevTools theme.
   * @param {string} theme - The current DevTools theme ("light", "dark", or others).
   */
  function setBootstrapTheme(theme) {
    const html = document.documentElement;
    if (theme === "dark") {
      html.setAttribute("data-bs-theme", "dark");
    } else {
      html.setAttribute("data-bs-theme", "light");
    }
  }

  // Initial theme set, if possible
  if (window.matchMedia) {
    // Attempt to guess initial theme using prefers-color-scheme as fallback
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setBootstrapTheme(prefersDark ? "dark" : "light");
  }

  // Listen for Firefox DevTools theme changes (if available)
  if (typeof browser !== "undefined" && browser.devtools && browser.devtools.panels && browser.devtools.panels.onThemeChanged) {
    browser.devtools.panels.onThemeChanged.addListener(setBootstrapTheme);
  }
})();

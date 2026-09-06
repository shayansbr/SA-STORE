// ============================================================
// THEME TOGGLE — light/dark mode
// The early-set snippet in each page's <head> already applies
// the saved theme before paint (avoids a flash). This file just
// wires up the toggle button once the DOM is ready.
// ============================================================

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sa-store-theme", next);
  });
}

document.addEventListener("DOMContentLoaded", initThemeToggle);

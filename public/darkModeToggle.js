/* ------------------------------------------------------------------
 * Dark Mode Toggle Component
 *
 * Adds a manual dark‑mode toggle button to the page, persists the
 * preference in localStorage, announces changes via an ARIA live
 * region, and shows a toast notification.
 *
 * Dependencies:
 *   - public/ariaLiveRegion.js   (provides `announce(message)`)
 *   - public/toastManager.js     (provides `showToast(message)`)
 *
 * The script self‑initialises on DOMContentLoaded.
 * ------------------------------------------------------------------ */

(() => {
  'use strict';

  // Configuration
  const STORAGE_KEY = 'manualDarkMode';
  const BUTTON_ID = 'dark-mode-toggle';
  const LIVE_REGION_ID = 'dark-mode-live';

  // Helper: get current mode
  const isDarkMode = () => document.documentElement.classList.contains('manual-dark');

  // Helper: persist preference
  const persistPreference = (enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch (_) {
      // ignore storage errors (e.g., private mode)
    }
  };

  // Helper: load persisted preference
  const loadPreference = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {
      return false;
    }
  };

  // Toggle dark mode class on <html>
  const applyDarkMode = (enable) => {
    const html = document.documentElement;
    if (enable) {
      html.classList.add('manual-dark');
    } else {
      html.classList.remove('manual-dark');
    }
    persistPreference(enable);
    // ARIA live announcement
    if (typeof announce === 'function') {
      announce(`Dark mode ${enable ? 'enabled' : 'disabled'}`);
    }
    // Toast feedback
    if (typeof showToast === 'function') {
      showToast(`Dark mode ${enable ? 'on' : 'off'}`);
    }
  };

  // Create the toggle button
  const createButton = () => {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.textContent = 'Toggle Dark Mode';
    btn.addEventListener('click', () => {
      const now = !isDarkMode();
      applyDarkMode(now);
      btn.setAttribute('aria-pressed', now);
    });
    // Keyboard shortcut: "D"
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        btn.click();
      }
    });
    return btn;
  };

  // Insert button into the .actions container
  const insertButton = () => {
    const actions = document.querySelector('.actions');
    if (!actions) return;
    const btn = createButton();
    actions.appendChild(btn);
  };

  // Initialise on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Apply persisted preference first
    const persisted = loadPreference();
    if (persisted) {
      applyDarkMode(true);
      const btn = document.getElementById(BUTTON_ID);
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }
    insertButton();
  });
})();

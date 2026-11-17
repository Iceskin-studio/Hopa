/* public/theme.js
 * Frontend UI Engineer – Component 3
 * Handles manual dark‑mode persistence, keyboard shortcut, and optional button toggle.
 */

(() => {
  const THEME_KEY = 'theme';
  const DARK_CLASS = 'manual-dark';
  const CACHE = {
    dark: 'dark',
    light: 'light',
  };

  // Apply stored theme on load
  const applyStoredTheme = () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === CACHE.dark) {
      document.documentElement.classList.add(DARK_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
    }
  };

  // Toggle theme and persist
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle(DARK_CLASS);
    localStorage.setItem(THEME_KEY, isDark ? CACHE.dark : CACHE.light);
  };

  // Keyboard shortcut: press "d" (ignore when typing)
  const onKeyDown = (e) => {
    // Ignore if focus is on an input, textarea or contenteditable element
    const active = document.activeElement;
    const ignore = active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable
    );
    if (ignore) return;

    if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      toggleTheme();
    }
  };

  // Optional button support (button with id="theme-toggle")
  const initButton = () => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
    // Keep button label in sync
    const updateLabel = () => {
      btn.textContent = document.documentElement.classList.contains(DARK_CLASS)
        ? 'Light mode'
        : 'Dark mode';
    };
    updateLabel();
    document.documentElement.addEventListener('classchange', updateLabel);
  };

  // Listen for class changes (custom event)
  const observeClassChanges = () => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          const event = new Event('classchange');
          document.documentElement.dispatchEvent(event);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
  };

  // Initialize
  applyStoredTheme();
  document.addEventListener('keydown', onKeyDown);
  initButton();
  observeClassChanges();
})();

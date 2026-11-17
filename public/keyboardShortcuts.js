/* public/keyboardShortcuts.js
 * Adds keyboard shortcuts for improved UX:
 *   - Ctrl+D / Cmd+D : Toggle dark mode (via existing theme.js)
 *   - Ctrl+K / Cmd+K : Focus the greeting heading (h1)
 *   - Ctrl+L / Cmd+L : Announce page load via ARIA live region
 */

(() => {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const ctrlKey = isMac ? 'metaKey' : 'ctrlKey';

  // Helper to toggle dark mode – assumes theme.js exposes toggleManualDark()
  function toggleDarkMode() {
    if (typeof window.toggleManualDark === 'function') {
      window.toggleManualDark();
      showToast('Dark mode toggled');
    }
  }

  // Focus the main greeting element
  function focusGreeting() {
    const heading = document.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
      showToast('Greeting focused');
    }
  }

  // Announce via ARIA live region
  function announce(message) {
    const live = document.getElementById('aria-live-announcer');
    if (live) {
      live.textContent = '';
      setTimeout(() => (live.textContent = message), 100);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!e[ctrlKey]) return;

    switch (e.key.toLowerCase()) {
      case 'd':
        e.preventDefault();
        toggleDarkMode();
        break;
      case 'k':
        e.preventDefault();
        focusGreeting();
        break;
      case 'l':
        e.preventDefault();
        announce('Page loaded with Arabic greeting');
        break;
      default:
        break;
    }
  });
})();

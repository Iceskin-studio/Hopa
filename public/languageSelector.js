/* Language selector component – lets user choose greeting language
   Enhanced with ARIA live region updates, toast notifications, and a
   manual dark‑mode toggle button for better accessibility and user feedback.
*/
(() => {
  const languages = {
    en: "Hello",
    ar: "اهلا",
    fr: "Bonjour",
    es: "Hola",
    de: "Hallo",
    ja: "こんにちは",
  };

  // ---------- Helper: Toast ----------
  const getToastContainer = () => {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    const container = getToastContainer();
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  };

  // ---------- Helper: ARIA Live Region ----------
  const getLiveRegion = () => {
    let region = document.getElementById('greeting-live');
    if (!region) {
      region = document.createElement('div');
      region.id = 'greeting-live';
      region.setAttribute('aria-live', 'polite');
      region.className = 'visually-hidden';
      document.querySelector('.container').appendChild(region);
    }
    return region;
  };

  // ---------- Greeting Update ----------
  const greetingEl = document.querySelector('h1');
  const liveRegion = getLiveRegion();

  const updateGreeting = (code) => {
    const text = languages[code] || '';
    greetingEl.textContent = text;
    liveRegion.textContent = `Greeting changed to ${text}`;
    showToast(`Language set to ${code.toUpperCase()}`);
  };

  // ---------- Language Selector UI ----------
  const select = document.createElement('select');
  select.id = 'language-select';
  select.style.marginTop = '1rem';
  Object.keys(languages).forEach((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code.toUpperCase()} - ${languages[code]}`;
    select.appendChild(option);
  });
  const container = document.querySelector('.container');
  container.appendChild(select);
  select.addEventListener('change', (e) => updateGreeting(e.target.value));

  // ---------- Dark‑Mode Toggle ----------
  const darkToggle = document.createElement('button');
  darkToggle.id = 'dark-mode-toggle';
  darkToggle.type = 'button';
  darkToggle.textContent = 'Toggle Dark Mode';
  darkToggle.style.marginTop = '1rem';
  container.appendChild(darkToggle);

  const isDark = () => document.documentElement.classList.contains('manual-dark');

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('manual-dark');
    const state = isDark() ? 'enabled' : 'disabled';
    liveRegion.textContent = `Dark mode ${state}`;
    showToast(`Dark mode ${state}`);
  };

  darkToggle.addEventListener('click', toggleDarkMode);

  // ---------- Keyboard Shortcut (D) ----------
  document.addEventListener('keydown', (e) => {
    // Avoid interfering when typing in inputs/selects
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
    if (e.key.toLowerCase() === 'd') {
      e.preventDefault();
      toggleDarkMode();
    }
  });

  // ---------- Initialise ----------
  // Default language: Arabic
  select.value = 'ar';
  updateGreeting('ar');
})();

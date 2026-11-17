/* UI Enhancements for the Arabic Greeting page */
'use strict';

// ---------- Constants ----------
const THEME_KEY = 'preferredTheme';
const DARK_CLASS = 'manual-dark';
const COPY_STATUS_TIMEOUT = 2000;

// ---------- Elements ----------
const copyBtn = document.getElementById('copyBtn');
const greetingEl = document.getElementById('greeting');
const copyStatus = document.getElementById('copyStatus');
const themeToggle = document.getElementById('themeToggle');

// ---------- Helper Functions ----------
/**
 * Shows a temporary status message (ARIA live region).
 * @param {string} message Arabic status text.
 */
function showCopyStatus(message) {
  copyStatus.textContent = message;
  copyStatus.classList.remove('visually-hidden');
  // Ensure screen readers announce the change
  copyStatus.setAttribute('aria-live', 'assertive');

  // Hide after a short delay
  setTimeout(() => {
    copyStatus.classList.add('visually-hidden');
    copyStatus.textContent = '';
  }, COPY_STATUS_TIMEOUT);
}

/**
 * Copies the greeting text to the clipboard with fallback.
 */
async function copyGreeting() {
  const text = greetingEl.textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
    showCopyStatus('تم نسخ التحية إلى الحافظة');
  } catch (err) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        showCopyStatus('تم نسخ التحية إلى الحافظة');
        return;
      }
      throw new Error('execCommand failed');
    } catch (fallbackErr) {
      console.error('Clipboard fallback error:', fallbackErr);
      showCopyStatus('فشل النسخ');
    }
  }
}

/**
 * Applies the stored theme (if any) on page load.
 */
function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark') {
    document.documentElement.classList.add(DARK_CLASS);
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.textContent = 'تبديل إلى الوضع الفاتح';
  }
}

/**
 * Toggles manual dark mode and persists the choice.
 */
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle(DARK_CLASS);
  themeToggle.setAttribute('aria-pressed', isDark);
  themeToggle.textContent = isDark
    ? 'تبديل إلى الوضع الفاتح'
    : 'تبديل الوضع الليلي';
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

/**
 * Keyboard shortcuts:
 *   Ctrl/Cmd + C → copy greeting
 *   Ctrl/Cmd + T → toggle theme
 */
function handleKeydown(e) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrl = isMac ? e.metaKey : e.ctrlKey;

  if (ctrl && e.key.toLowerCase() === 'c') {
    e.preventDefault();
    copyGreeting();
  } else if (ctrl && e.key.toLowerCase() === 't') {
    e.preventDefault();
    toggleTheme();
  }
}

// ---------- Event Listeners ----------
copyBtn.addEventListener('click', copyGreeting);
themeToggle.addEventListener('click', toggleTheme);
document.addEventListener('keydown', handleKeydown);

// ---------- Initialization ----------
applyStoredTheme();

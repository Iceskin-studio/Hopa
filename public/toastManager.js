/**
 * Toast Manager – a tiny utility to show accessible toast notifications.
 *
 * Usage:
 *   import { showToast } from './toastManager.js';
 *   showToast('Message', { type: 'info', duration: 3000 });
 *
 * The manager creates a single .toast-container element (if not present)
 * and appends toast elements that auto‑dismiss after the configured duration.
 * It also announces the message via an ARIA live region for screen‑reader users.
 */

const TOAST_CONTAINER_ID = 'toast-container';
const ARIA_LIVE_ID = 'toast-aria-live';
const DEFAULT_DURATION = 3000; // ms

// Ensure a container exists in the DOM
function getContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// Ensure an ARIA live region exists (visually hidden)
function getAriaLiveRegion() {
  let region = document.getElementById(ARIA_LIVE_ID);
  if (!region) {
    region = document.createElement('div');
    region.id = ARIA_LIVE_ID;
    region.className = 'visually-hidden';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  return region;
}

/**
 * Show a toast.
 *
 * @param {string} message - Text to display.
 * @param {Object} [options] - Optional settings.
 * @param {number} [options.duration] - Milliseconds before auto‑dismiss.
 * @param {string} [options.type] - 'info' | 'success' | 'error' (currently only for future styling).
 */
export function showToast(message, options = {}) {
  const duration = options.duration ?? DEFAULT_DURATION;
  const container = getContainer();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  // Allow future CSS hooks based on type
  if (options.type) toast.dataset.type = options.type;

  // Show animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto‑remove after duration
  const hide = () => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };
  const timeoutId = setTimeout(hide, duration);

  // Click to dismiss early
  toast.addEventListener('click', () => {
    clearTimeout(timeoutId);
    hide();
  });

  container.appendChild(toast);

  // Announce for screen readers
  const live = getAriaLiveRegion();
  live.textContent = ''; // clear previous
  // Small delay ensures the live region picks up the new text
  setTimeout(() => {
    live.textContent = message;
  }, 100);
}

/**
 * Clear all toasts immediately.
 */
export function clearAllToasts() {
  const container = document.getElementById(TOAST_CONTAINER_ID);
  if (container) {
    container.innerHTML = '';
  }
}

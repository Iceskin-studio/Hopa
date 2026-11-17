/* public/notification.js
 * Simple toast notification system.
 * Usage: showToast('Your message', {duration: 3000});
 */

(() => {
  const DEFAULT_DURATION = 3000; // ms

  // Ensure a container exists
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  /**
   * Show a toast message.
   * @param {string} message - Text to display.
   * @param {Object} [options] - Optional settings.
   * @param {number} [options.duration] - How long to show (ms).
   */
  function showToast(message, options = {}) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);
    // Force reflow for transition
    void toast.offsetWidth;
    toast.classList.add('show');

    const duration = options.duration ?? DEFAULT_DURATION;
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  }

  // Expose globally
  window.showToast = showToast;
})();

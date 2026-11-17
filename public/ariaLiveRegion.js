/* public/ariaLiveRegion.js
 * Inserts an ARIA live region into the DOM for screen‑reader announcements.
 * Other scripts can call `announce(message)` to speak updates.
 */

(() => {
  const liveRegion = document.createElement('div');
  liveRegion.id = 'aria-live-announcer';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'visually-hidden';
  document.body.appendChild(liveRegion);

  // Expose a simple global function
  window.announce = (msg) => {
    liveRegion.textContent = '';
    // Small delay ensures screen readers detect the change
    setTimeout(() => (liveRegion.textContent = msg), 100);
  };
})();

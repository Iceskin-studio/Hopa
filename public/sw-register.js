/* public/sw-register.js
 * Frontend UI Engineer – Component 3
 * Registers the service worker and logs status.
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('[SW] Registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });
  });
}

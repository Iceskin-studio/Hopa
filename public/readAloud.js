/**
 * readAloud.js
 * ----------------
 * Adds a "Read Aloud" button next to the greeting.
 * When clicked, it uses the Web Speech API to speak the greeting
 * in the appropriate language (Arabic by default).
 *
 * The script is self‑initialising: it runs on DOMContentLoaded,
 * creates the button, and wires up all necessary ARIA attributes
 * and toast notifications for success / error feedback.
 *
 * Dependencies:
 *   - public/notification.js (exposes `showToast(message, type?)`)
 *   - public/ariaLiveRegion.js (exposes `announce(message)`)
 *
 * The file is deliberately small (<150 lines) and does not
 * interfere with existing UI logic.
 */

(() => {
  'use strict';

  // Configuration – can be overridden via data‑attributes on the greeting element
  const DEFAULT_LANG = 'ar'; // Arabic
  const BUTTON_ID = 'read-aloud-btn';
  const GREETING_SELECTOR = '.greeting'; // Expected class on the <h1> element

  /**
   * Retrieve the greeting text from the page.
   * Falls back to the innerText of the first element matching GREETING_SELECTOR.
   */
  function getGreetingText() {
    const el = document.querySelector(GREETING_SELECTOR);
    return el ? el.innerText.trim() : null;
  }

  /**
   * Determine the language code for SpeechSynthesis.
   * Tries to read `data-lang` attribute on the greeting element,
   * otherwise falls back to DEFAULT_LANG.
   */
  function getGreetingLang() {
    const el = document.querySelector(GREETING_SELECTOR);
    return (el && el.dataset.lang) || DEFAULT_LANG;
  }

  /**
   * Create the "Read Aloud" button and insert it after the greeting.
   */
  function createButton() {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.className = 'read-aloud-btn';
    btn.textContent = '🔊 Read Aloud';
    btn.setAttribute('aria-label', 'Read the greeting aloud');
    btn.setAttribute('title', 'Read the greeting aloud');
    btn.style.marginTop = '1rem';
    btn.style.padding = '0.5rem 1rem';
    btn.style.fontSize = '1rem';
    btn.style.borderRadius = '0.4rem';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = '#2c3e50';
    btn.style.color = '#fff';
    btn.addEventListener('click', onReadAloud);
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onReadAloud();
      }
    });
    return btn;
  }

  /**
   * Handler for the button click – performs speech synthesis.
   */
  function onReadAloud() {
    const text = getGreetingText();
    if (!text) {
      announce('Greeting not found.');
      return;
    }

    if (!('speechSynthesis' in window)) {
      announce('Speech synthesis not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getGreetingLang();

    // Provide feedback via toast
    try {
      window.showToast && window.showToast('Speaking…', 'info');
    } catch (_) {}

    // Speak and handle end / error events
    utterance.onend = () => {
      window.showToast && window.showToast('Finished speaking.', 'success');
    };
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      window.showToast && window.showToast('Error speaking greeting.', 'error');
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Insert the button into the DOM once the page is ready.
   */
  function init() {
    const greetingEl = document.querySelector(GREETING_SELECTOR);
    if (!greetingEl) {
      console.warn('ReadAloud: No greeting element found.');
      return;
    }

    // Avoid duplicate insertion
    if (document.getElementById(BUTTON_ID)) return;

    const btn = createButton();
    greetingEl.parentNode.insertBefore(btn, greetingEl.nextSibling);
  }

  // Auto‑initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual re‑initialisation (e.g., after dynamic content changes)
  window.initReadAloud = init;
})();

/*
 * Volturia landing — logica globale della versione statica.
 *
 * CONFIGURAZIONE NEWSLETTER:
 *   1. Crea un form su https://formspree.io (o servizio equivalente)
 *   2. Sostituisci il valore di FORMSPREE_ENDPOINT con il tuo endpoint,
 *      oppure cambia l'attributo action del form in index.html.
 *      Se resta il placeholder YOUR_FORM_ID, l'invio viene bloccato con
 *      un messaggio di configurazione.
 */
(function () {
  'use strict';

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

  var MESSAGES = {
    success: "You're on the list. We'll keep you posted.",
    error: 'Something went wrong. Please try again.',
    invalid: 'Please enter a valid email address.',
    unconfigured: 'Newsletter signup is not configured yet.'
  };

  function showStatus(form, message, isError) {
    var status = form.querySelector('[data-form-status]');
    if (!status) return;
    status.textContent = message;
    status.classList.add('is-visible');
    status.classList.toggle('is-error', Boolean(isError));
  }

  function initNewsletterForm() {
    var form = document.querySelector('[data-newsletter-form]');
    if (!form) return;

    var endpoint = form.getAttribute('action') || FORMSPREE_ENDPOINT;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var input = form.querySelector('input[type="email"]');
      var email = input && input.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus(form, MESSAGES.invalid, true);
        return;
      }

      if (endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        showStatus(form, MESSAGES.unconfigured, true);
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (response) {
          if (response.ok) {
            showStatus(form, MESSAGES.success, false);
            form.reset();
          } else {
            showStatus(form, MESSAGES.error, true);
          }
        })
        .catch(function () {
          showStatus(form, MESSAGES.error, true);
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterForm);
  } else {
    initNewsletterForm();
  }
})();

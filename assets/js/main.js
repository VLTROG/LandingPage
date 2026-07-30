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

  function handleSuccess(form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var pillBtn = document.querySelector('.nl-pill-button');
    var input = form.querySelector('input[type="email"]');
    if (input) input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    if (pillBtn) pillBtn.disabled = true;

    form.classList.add('is-success');

    /* Micro-animazione di conferma: impulso sul bottone prima che il
       gruppo scompaia, poi enfasi sul messaggio di stato. */
    if (window.gsap) {
      if (pillBtn) {
        window.gsap.fromTo(
          pillBtn,
          { scale: 1 },
          { scale: 1.06, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }
        );
      }
      var status = form.querySelector('[data-form-status]');
      if (status) {
        window.gsap.fromTo(
          status,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.3, ease: 'power2.out' }
        );
      }
    }
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
            handleSuccess(form);
          } else {
            showStatus(form, MESSAGES.error, true);
          }
        })
        .catch(function () {
          showStatus(form, MESSAGES.error, true);
        })
        .finally(function () {
          if (submitBtn && !form.classList.contains('is-success')) {
            submitBtn.disabled = false;
          }
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterForm);
  } else {
    initNewsletterForm();
  }
})();

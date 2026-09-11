/*
 * Volturia landing — logica globale della versione statica.
 *
 * Newsletter: GitHub Pages è statico e non può scrivere un file nel repo.
 * Le iscrizioni vanno a contact@volturia.com via Formsubmit (ajax).
 * Se l'action del form è un endpoint Formspree reale, si usa quello.
 */
(function () {
  'use strict';

  var FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/contact@volturia.com';
  var SUCCESS_TEXT = 'Thank you for trusting us';

  var MESSAGES = {
    error: 'Something went wrong. Please try again.',
    invalid: 'Please enter a valid email address.'
  };

  function showStatus(form, message, isError) {
    var status = form.querySelector('[data-form-status]');
    if (!status) return;
    status.textContent = message;
    status.classList.add('is-visible');
    status.classList.toggle('is-error', Boolean(isError));
  }

  function hideStatus(form) {
    var status = form.querySelector('[data-form-status]');
    if (!status) return;
    status.textContent = '';
    status.classList.remove('is-visible', 'is-error');
  }

  function showThanks(form) {
    var group = form.querySelector('.newsletter-form-group');
    var thanks = form.querySelector('[data-form-thanks]');
    var wrap = form.closest('.nl-form');
    form.classList.add('is-success');
    if (group) group.classList.add('is-success');
    if (wrap) wrap.classList.add('is-success');
    if (thanks) {
      thanks.hidden = false;
      thanks.textContent = SUCCESS_TEXT;
    }
    hideStatus(form);
  }

  function resolveEndpoint(form) {
    var action = form.getAttribute('action') || '';
    if (action && action.indexOf('YOUR_FORM_ID') === -1) {
      return { url: action, mode: 'formdata' };
    }
    return { url: FORMSUBMIT_ENDPOINT, mode: 'json' };
  }

  function initNewsletterForm() {
    var form = document.querySelector('[data-newsletter-form]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.classList.contains('is-success') || form.classList.contains('is-sending')) {
        return;
      }

      var input = form.querySelector('input[type="email"]');
      var email = input && input.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus(form, MESSAGES.invalid, true);
        return;
      }

      hideStatus(form);
      form.classList.add('is-sending');

      var submitBtn = form.querySelector('button[type="submit"]');
      var pillBtn = document.querySelector('.nl-pill-button');
      if (submitBtn) submitBtn.disabled = true;
      if (pillBtn) pillBtn.disabled = true;

      var dest = resolveEndpoint(form);
      var request;

      if (dest.mode === 'json') {
        request = fetch(dest.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            email: email,
            _subject: 'Volturia — newsletter signup',
            _template: 'table',
            _captcha: 'false'
          })
        });
      } else {
        request = fetch(dest.url, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
      }

      request
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          }).catch(function () {
            return { ok: response.ok, data: null };
          });
        })
        .then(function (result) {
          var payload = result.data || {};
          var formsubmitOk = String(payload.success) === 'true';
          if (result.ok || formsubmitOk) {
            showThanks(form);
            return;
          }
          throw new Error('submit-failed');
        })
        .catch(function () {
          form.classList.remove('is-sending');
          if (submitBtn) submitBtn.disabled = false;
          if (pillBtn) pillBtn.disabled = false;
          showStatus(form, MESSAGES.error, true);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterForm);
  } else {
    initNewsletterForm();
  }
})();

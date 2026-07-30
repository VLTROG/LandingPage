/**
 * Glassmorphism interattivo — branch experiment/glass-interactions
 *
 * - Sheen al cursore + tilt 3D sui bento-box
 * - Sheen + effetto magnetico sul CTA "Get notified"
 * - Sheen su FAQ e finestra social
 * - 2c: cursore glass (anello + dot) che reagisce agli elementi interattivi
 * - 2d: effetto magnetico sulle icone social
 *
 * Disattivato con prefers-reduced-motion o su touch.
 */
(function () {
  'use strict';

  var reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer =
    window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reduced || !finePointer) return;

  document.documentElement.classList.add('glass-experiments');

  var isDesktop = window.innerWidth >= 769;

  function ensureSheen(el) {
    if (el.querySelector(':scope > .glass-sheen')) return;
    var sheen = document.createElement('span');
    sheen.className = 'glass-sheen';
    sheen.setAttribute('aria-hidden', 'true');
    el.appendChild(sheen);
  }

  function bindSheen(el) {
    ensureSheen(el);

    el.addEventListener('mouseenter', function () {
      el.classList.add('is-glass-active');
    });

    el.addEventListener('mouseleave', function () {
      el.classList.remove('is-glass-active');
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - rect.left + 'px');
      el.style.setProperty('--my', e.clientY - rect.top + 'px');
    });
  }

  function bindTilt(el, maxDeg) {
    maxDeg = maxDeg || 4;

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform =
        'rotateY(' + px * maxDeg + 'deg) rotateX(' + -py * maxDeg + 'deg)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  }

  function bindMagnetic(el, strength) {
    strength = strength || 0.18;

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var dx = e.clientX - (rect.left + rect.width / 2);
      var dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform =
        'translate(' + dx * strength + 'px, ' + dy * strength + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  }

  /* 2c — Cursore glass: anello con blur + dot, ease fluido via rAF.
     Il cursore nativo resta visibile: l'anello è un accento che scala
     sugli elementi interattivi. */
  function initCursor() {
    var ring = document.createElement('div');
    ring.className = 'glass-cursor';
    ring.setAttribute('aria-hidden', 'true');
    var dot = document.createElement('div');
    dot.className = 'glass-cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var targetX = -100, targetY = -100;
    var ringX = -100, ringY = -100;
    var visible = false;

    document.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        ring.classList.add('is-visible');
        dot.classList.add('is-visible');
        ringX = targetX;
        ringY = targetY;
      }
      dot.style.setProperty('--cx', targetX + 'px');
      dot.style.setProperty('--cy', targetY + 'px');
    });

    document.addEventListener('mouseleave', function () {
      visible = false;
      ring.classList.remove('is-visible');
      dot.classList.remove('is-visible');
    });

    var HOVERABLE = 'a, button, input, .faq-item, .nl-card-wrap, .sw-icon';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOVERABLE)) {
        ring.classList.add('is-cursor-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOVERABLE)) {
        ring.classList.remove('is-cursor-hover');
      }
    });

    (function loop() {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      ring.style.setProperty('--cx', ringX + 'px');
      ring.style.setProperty('--cy', ringY + 'px');
      requestAnimationFrame(loop);
    })();
  }

  function init() {
    if (isDesktop) {
      document.querySelectorAll('.bento .box').forEach(function (box) {
        bindSheen(box);
        bindTilt(box, 4);
      });
    }

    document.querySelectorAll('.nl-pill-button').forEach(function (btn) {
      bindSheen(btn);
      if (isDesktop) {
        bindMagnetic(btn, 0.15);
      }
    });

    /* 2d — icone social magnetiche (lo scale dell'hover si sposta
       sullo span interno per non confliggere col translate) */
    document.querySelectorAll('.sw-icon').forEach(function (icon) {
      if (isDesktop) {
        bindMagnetic(icon, 0.3);
      }
    });

    document.querySelectorAll('[class*="faqs_"] .faq-item').forEach(function (item) {
      bindSheen(item);
    });

    var socialWindow = document.querySelector('.sw-window');
    if (socialWindow) {
      bindSheen(socialWindow);
    }

    initCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

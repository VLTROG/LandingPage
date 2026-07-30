/**
 * Esperienza premium — branch experiment/glass-interactions
 *
 * - 2a: Lenis smooth scroll integrato con ScrollTrigger
 * - 2b: parallax leggero sul video background
 * - 2e: titolo VOLTURIA che si dissolve nei primi 100vh
 * - 4a: fallback se GSAP non carica (la pagina degrada a statica)
 * - 4b: ScrollTrigger stabile su mobile (barra URL)
 *
 * Tutto è no-op se le librerie mancano o con prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 4a — Fallback GSAP: se dopo 2.5s gsap non c'è, ripristina gli elementi
     bloccati nello stato iniziale (blur) dagli script inline delle sezioni. */
  window.setTimeout(function () {
    if (window.gsap) return;
    document.querySelectorAll('.gsap-reveal').forEach(function (el) {
      el.classList.remove('gsap-reveal');
      el.style.removeProperty('filter');
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.style.removeProperty('animation');
    });
    document.querySelectorAll('.gsap-enabled').forEach(function (el) {
      el.classList.remove('gsap-enabled');
    });
  }, 2500);

  function initLenis() {
    if (reduced || !window.Lenis || !window.gsap || !window.ScrollTrigger) return null;

    var lenis = new window.Lenis({
      duration: 1.15,
      smoothWheel: true
    });

    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  function initScrollEffects() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;

    /* 4b — evita re-trigger quando la barra URL mobile appare/scompare */
    window.ScrollTrigger.config({ ignoreMobileResize: true });

    /* 2b — parallax leggero sul fondale: scala appena sopra il viewport
       così la traslazione non scopre mai i bordi. */
    var bgVideo = document.querySelector('.background-video video');
    if (bgVideo) {
      window.gsap.fromTo(
        bgVideo,
        { yPercent: -4, scale: 1.1 },
        {
          yPercent: 4,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'max',
            scrub: 0.6
          }
        }
      );
    }

    /* 2e — le lettere VOLTURIA si dissolvono mentre si scorre verso
       la sezione newsletter (l'animazione CSS tocca solo text-shadow,
       quindi opacity/filter/transform non confliggono). */
    var titleSection = document.querySelector('.volturia-title-psw');
    var letters = document.querySelectorAll('.volturia-title-psw .loader span');
    if (titleSection && letters.length) {
      window.gsap.to(letters, {
        opacity: 0.08,
        filter: 'blur(12px)',
        y: -36,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: {
          trigger: titleSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    }
  }

  function init() {
    initLenis();
    initScrollEffects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

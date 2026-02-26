/**
 * Adaptation Forest — forest.js
 * Species card expand / collapse
 */

'use strict';

function initSpeciesCards() {
  const cards = document.querySelectorAll('.species-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const toggle = card.querySelector('.species-card__toggle');
    if (!toggle) return;

    card.addEventListener('click', () => {
      const isExpanded = card.classList.contains('is-expanded');

      // Close all other cards
      cards.forEach(c => {
        if (c !== card) {
          c.classList.remove('is-expanded');
          const t = c.querySelector('.species-card__toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this card
      card.classList.toggle('is-expanded', !isExpanded);
      toggle.setAttribute('aria-expanded', String(!isExpanded));
    });
  });
}

function initCarbonCounter() {
  const el = document.getElementById('carbon-count');
  if (!el) return;

  const target = parseFloat(el.dataset.target || '31');
  let started = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      const t0 = performance.now();
      const dur = 2400;

      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    }
  }, { threshold: 0.5 });

  observer.observe(el);
}

document.addEventListener('DOMContentLoaded', () => {
  initSpeciesCards();
  initCarbonCounter();
});

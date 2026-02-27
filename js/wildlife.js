/**
 * Adaptation Forest — wildlife.js
 * Bird card expand / collapse
 * Same interaction pattern as species cards in forest.js
 */

'use strict';

function initBirdCards() {
  const cards = document.querySelectorAll('.bird-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const toggle = card.querySelector('.bird-card__toggle');
    if (!toggle) return;

    card.addEventListener('click', () => {
      const isExpanded = card.classList.contains('is-expanded');

      // Close all other cards (radio behaviour)
      cards.forEach(c => {
        if (c !== card) {
          c.classList.remove('is-expanded');
          const t = c.querySelector('.bird-card__toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this card
      card.classList.toggle('is-expanded', !isExpanded);
      toggle.setAttribute('aria-expanded', String(!isExpanded));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initBirdCards();
});

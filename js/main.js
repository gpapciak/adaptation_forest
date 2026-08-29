/**
 * Adaptation Forest — main.js
 * Nav · Hero stagger · SVG draw-on-scroll · Scroll reveal · Mobile menu
 */

'use strict';

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// 1. Navigation
// ============================================================

function initNav() {
  const nav    = qs('#main-nav');
  const hero   = qs('#hero');
  const toggle = qs('.nav-toggle');
  const links  = qs('.nav-links');
  const items  = qsa('.nav-links a');
  const sects  = qsa('section[id]');

  if (!nav || !hero) return;

  // Show nav after hero passes out of view
  function updateNavVisibility() {
    const threshold = hero.offsetHeight * 0.85;
    nav.classList.toggle('nav--visible', window.scrollY > threshold);
    highlightActive();
  }

  // Mark the link whose section is currently most in view
  function highlightActive() {
    const mid = window.scrollY + window.innerHeight * 0.4;
    sects.forEach(section => {
      const link = qs(`.nav-links a[href="#${section.id}"]`);
      if (!link) return;
      const inView = mid >= section.offsetTop && mid < section.offsetTop + section.offsetHeight;
      link.classList.toggle('active', inView);
    });
  }

  window.addEventListener('scroll', updateNavVisibility, { passive: true });
  updateNavVisibility();

  // Mobile menu
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    toggle.setAttribute('aria-expanded', String(next));
    links.classList.toggle('is-open', next);
    document.body.style.overflow = next ? 'hidden' : '';
  });

  items.forEach(item => {
    item.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

// ============================================================
// 2. Hero stagger animation
// ============================================================

// Seasonal detection: the forest has been doing this for
// 10,000 years without JavaScript.
function initHero() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Draw the forest silhouette first
  const silPath = qs('.hero-silhouette path');
  if (silPath) {
    const len = silPath.getTotalLength();
    silPath.style.strokeDasharray  = len;
    silPath.style.strokeDashoffset = len;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        silPath.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        silPath.style.strokeDashoffset = '0';
      });
    });
  }

  // Stagger text elements
  const schedule = [
    ['.hero-eyebrow', 300],
    ['.hero-title',   700],
    ['.hero-tagline', 1050],
    ['.hero-scroll',  1400],
  ];

  schedule.forEach(([sel, delay]) => {
    const el = qs(sel);
    if (el) {
      setTimeout(() => el.classList.add('is-visible'), delay);
    }
  });
}

// ============================================================
// 3. SVG draw-on-scroll
// ============================================================

function initSVGDraw() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const containers = qsa('.svg-animate');
  if (!containers.length) return;

  // For each container, set up the initial hidden state on all .draw elements
  containers.forEach(container => {
    const drawEls = qsa('.draw', container);

    drawEls.forEach(el => {
      const len = typeof el.getTotalLength === 'function'
        ? el.getTotalLength()
        : 800; // fallback for shapes without getTotalLength

      el.style.strokeDasharray  = len;
      el.style.strokeDashoffset = len;
      el.style.transition       = 'none'; // prevent transition on setup
    });
  });

  // Observe each container; trigger draw when it enters viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const drawEls = qsa('.draw', entry.target);

      drawEls.forEach((el, i) => {
        const duration = Math.min(1.6 + i * 0.06, 3.2);
        const delay    = i * 0.11;
        el.style.transition       = `stroke-dashoffset ${duration}s cubic-bezier(0.4,0,0.15,1) ${delay}s`;
        el.style.strokeDashoffset = '0';
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  containers.forEach(c => observer.observe(c));
}

// ============================================================
// 4. Scroll reveal for text elements
// ============================================================

// If you're a deer reading this source code,
// please stop eating the oak seedlings.
function initReveal() {
  const targets = qsa('.reveal');
  if (!targets.length) return;

  // Stagger siblings within the same parent
  const parents = new Map();
  targets.forEach(el => {
    const p = el.parentElement;
    if (!parents.has(p)) parents.set(p, []);
    parents.get(p).push(el);
  });
  parents.forEach(siblings => {
    siblings.forEach((el, i) => {
      if (i > 0) el.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ============================================================
// 5. "This season" — auto-generated from the visitor's local date
// ============================================================

// Generic seasonal copy for a northeastern hardwood forest.
// Not tied to specific stands/acreage — describes the kind of
// work and forest change that usually happens in each season.
const SEASONAL_CONTENT = {
  spring: "Spring arrives here in stages — the first ephemerals up through last year's leaf litter before the canopy has fully closed. This is the season for invasive species removal, when barberry and buckthorn are still bare and easy to spot before they leaf out and hide among the natives. It's also prime time for crop-tree release — freeing the most promising young oaks and maples from the trees crowding them — and for planting seedlings into ground opened by winter thinning. Trail crews are usually out clearing the blowdown that accumulated over winter. There is more work than there is time for, which is more or less the normal condition here.",
  summer: "By summer the canopy has closed and the understory is thick with growth. Forestry work slows during the growing season — the priority shifts to monitoring rather than cutting: watching for emerald ash borer, beech bark disease, and the invasive plants that took hold in the open ground left by winter and spring work. Trails get walked and maintained rather than built. It's the season for observing what took, what didn't, and what the forest is doing with the openings it was given. Later in summer, seed collection begins in earnest, ahead of the fall planting window.",
  autumn: "Autumn brings the mast — acorns and beechnuts dropping in a pattern that shifts from year to year — and, not long after, the color change and the long defoliation that follows it. Forestry work resumes once the growing season ends: stand-improvement thinning, tree planting in the cool, moist ground that favors root establishment, and a final push on invasive species removal before frost hardens the soil. Trail crews are usually out ahead of winter, clearing the season's deadfall and staging drainage work before the ground freezes.",
  winter: "Winter is when the ground itself becomes useful — once it freezes hard enough to carry equipment without rutting the soil, most of the heavier thinning and timber-stand-improvement work happens. Trees are marked for removal ahead of the growing season, brush is cleared, and storm damage from ice and wind gets cleaned up. It's also the best season for reading the forest in another way: tracks in snow reveal who has been moving through — deer, coyote, fisher, the occasional bobcat — in a level of detail the other three seasons don't offer. Planning for spring planting and invasive removal usually starts here too.",
};

// Meteorological (not astronomical) seasons, Northern Hemisphere.
function getSeasonInfo(date) {
  const month = date.getMonth() + 1; // 1–12
  const year  = date.getFullYear();

  if (month === 12)                   return { key: 'winter', label: `Winter ${year + 1}` };
  if (month === 1 || month === 2)     return { key: 'winter', label: `Winter ${year}` };
  if (month >= 3 && month <= 5)       return { key: 'spring', label: `Spring ${year}` };
  if (month >= 6 && month <= 8)       return { key: 'summer', label: `Summer ${year}` };
  return                                     { key: 'autumn', label: `Autumn ${year}` };
}

function initSeasonalNote() {
  const dateline = qs('#seasonal-dateline');
  const body     = qs('#seasonal-body');
  if (!dateline || !body) return;

  const { key, label } = getSeasonInfo(new Date());
  const text = SEASONAL_CONTENT[key];
  if (!text) return;

  dateline.textContent = label;
  body.textContent = text;
}

// ============================================================
// 6. Smooth scroll polyfill (for older browsers)
// ============================================================

function initSmoothScroll() {
  if (CSS.supports('scroll-behavior', 'smooth')) return;
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================================
// Boot
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHero();
  initSVGDraw();
  initReveal();
  initSeasonalNote();
  initSmoothScroll();
});

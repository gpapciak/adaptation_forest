/**
 * Adaptation Forest — garden.js
 * Food forest layer interaction · Garden seasonal calendar
 */

'use strict';

/* ============================================================
   Food Forest — 7-Layer Interactive Diagram
   Click a layer-zone rect to populate the info panel.
   ============================================================ */

const LAYERS = {
  canopy: {
    name:        'Canopy Layer',
    height:      '30–60+ ft',
    description: 'The tallest tier — large nut and fruit trees that define the light environment for everything below. Canopy trees are the long-term investment: 20–50 years to peak production, but they build deep root systems that cycle nutrients from subsoil, provide structural habitat for wildlife, and sequester carbon at scale.',
    species:     ['American Chestnut (blight-resistant)', 'Shagbark Hickory', 'Bitternut Hickory', 'Black Walnut', 'Butternut', 'American Beech']
  },
  understory: {
    name:        'Understory Tree Layer',
    height:      '10–30 ft',
    description: 'Mid-story trees adapted to partial shade, producing fruit and berries in the window of light they receive. Many are also nitrogen-fixers or wildlife keystone species. They reach production in 5–15 years, well before the canopy trees reach full size.',
    species:     ['Serviceberry (Amelanchier)', 'Pawpaw', 'American Persimmon', 'Heritage Apple (semi-dwarf)', 'Wild Plum', 'Cornelian Cherry Dogwood']
  },
  shrub: {
    name:        'Shrub Layer',
    height:      '3–10 ft',
    description: 'Productive multi-stemmed shrubs that thrive in the dappled light beneath the upper stories. Many fix nitrogen, provide wildlife habitat, and begin bearing fruit within 2–4 years of planting. The shrub layer is often the first to produce and the most consistently abundant.',
    species:     ['Elderberry', 'Black Currant', 'Red Currant', 'American Hazelnut', 'Highbush Blueberry', 'Gooseberry', 'Nanking Cherry']
  },
  vine: {
    name:        'Vine Layer',
    height:      'Climbs to canopy',
    description: 'Climbing plants that use vertical structures — trees, posts, the canopy itself — to reach light while occupying minimal ground space. Vines thread through multiple layers simultaneously, filling niches that no other growth form occupies. They can be highly productive in a small footprint.',
    species:     ['Hardy Kiwi (Actinidia arguta)', 'Native Grape (Vitis labrusca)', 'Hops', 'Passionflower', 'American Groundnut (Apios)']
  },
  herbaceous: {
    name:        'Herbaceous Layer',
    height:      '1–4 ft',
    description: 'Perennial herbs and dynamic accumulators that die back to ground each winter and regrow from root systems. Many are multi-functional: food, medicine, pollinator support, and soil building all in one plant. This layer is the most biodiverse in terms of species count and fills the understory year-round.',
    species:     ['Comfrey', 'Ramps / Wild Leek (Allium tricoccum)', 'Ostrich Fern', 'Bee Balm (Monarda)', 'Lovage', 'Yarrow', 'Jerusalem Artichoke']
  },
  groundcover: {
    name:        'Ground Cover Layer',
    height:      'Under 1 ft',
    description: 'Low-growing plants that protect the soil surface, retain moisture, suppress weeds, and provide habitat for ground-dwelling insects and birds. In a food forest, ground covers are not ornamental — they are the living mulch that makes the whole system more resilient and reduces maintenance over time.',
    species:     ['Wild Strawberry', 'Creeping Thyme', 'White Clover', 'Wood Violets', 'Ajuga', 'Sweet Woodruff', 'Creeping Raspberry']
  },
  root: {
    name:        'Root Layer',
    height:      'Below ground',
    description: 'Edible root and tuber crops that occupy the soil layer, harvested by digging. Root crops are invisible to the human eye but critically important as a caloric and nutritional resource, and some species — like groundnut and Jerusalem artichoke — also fix nitrogen or provide above-ground biomass. This layer uses space that no other layer can access.',
    species:     ['Groundnut (Apios americana)', 'Jerusalem Artichoke', 'Horseradish', 'Skirret', 'Chinese Artichoke (Stachys)', 'Ramps (harvested sparingly)']
  }
};

function initFoodForest() {
  const svg   = document.querySelector('.food-forest-svg');
  const panel = document.getElementById('layer-panel');
  if (!svg || !panel) return;

  const nameEl    = document.getElementById('panel-layer-name');
  const heightEl  = document.getElementById('panel-layer-height');
  const descEl    = document.getElementById('panel-layer-desc');
  const speciesEl = document.getElementById('panel-layer-species');

  let activeZone = null;

  function showLayer(key) {
    const data = LAYERS[key];
    if (!data) return;

    nameEl.textContent   = data.name;
    heightEl.textContent = data.height;
    descEl.textContent   = data.description;

    speciesEl.innerHTML = data.species
      .map(s => `<li>${s}</li>`)
      .join('');
  }

  svg.querySelectorAll('.layer-zone').forEach(rect => {
    rect.addEventListener('click', () => {
      const key = rect.getAttribute('data-layer');

      // Toggle active highlight
      if (activeZone) activeZone.classList.remove('is-active');
      if (activeZone === rect) {
        activeZone = null;
        // Reset panel to default
        nameEl.textContent   = 'Select a layer';
        heightEl.textContent = '';
        descEl.textContent   = 'Click any horizontal band in the diagram above to explore that layer\'s role and planned species.';
        speciesEl.innerHTML  = '';
        return;
      }
      activeZone = rect;
      rect.classList.add('is-active');

      showLayer(key);

      // Smooth scroll the panel into view on small screens
      if (window.innerWidth < 680) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

/* ============================================================
   Garden Seasonal Calendar
   Canvas-based circular calendar. Auto-highlights current month.
   ============================================================ */

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const SEASONS = [
  { name: 'Winter', months: [11, 0, 1],  color: '#1a2a34' },
  { name: 'Spring', months: [2, 3, 4],   color: '#1e3a1e' },
  { name: 'Summer', months: [5, 6, 7],   color: '#263418' },
  { name: 'Autumn', months: [8, 9, 10],  color: '#382a10' }
];

function getSeasonColor(monthIndex) {
  for (const s of SEASONS) {
    if (s.months.includes(monthIndex)) return s.color;
  }
  return '#1a2a34';
}

const GARDEN_TASKS = {
  0:  [ 'Order seeds — focus on open-pollinated varieties', 'Draft planting plans and bed layouts', 'Prune fruit trees while fully dormant', 'Review and refresh seed storage', 'Repair trellises and raised bed infrastructure', 'Read and research: rootstock, grafting, soil biology' ],
  1:  [ 'Start slow crops indoors: onions, leeks, celery', 'Prune apple and pear while dormant', 'Test soil pH in planned planting areas', 'Begin cold stratification for tree seeds', 'Place seed orders — check germination rates', 'Early sugaring season begins (sap in warm spells)' ],
  2:  [ 'First ramps emerge — harvest sparingly', 'Direct sow cold-tolerant greens outdoors', 'Start tomatoes, peppers, eggplant indoors', 'Plant garlic (if not done in fall)', 'Apply dormant oil spray to fruit trees if needed', 'Begin compost turning as temps rise' ],
  3:  [ 'Transplant cold-hardy starts outdoors', 'Plant potatoes and early root crops', 'Sow succession greens every 2 weeks', 'Divide perennials: comfrey, bee balm, lovage', 'Plant bare-root fruit trees and shrubs', 'Watch for first service berry bloom — frost indicator' ],
  4:  [ 'Last frost risk passes — transplant tomatoes etc.', 'Bird breeding season begins: quiet in sensitive areas', 'Direct sow beans, squash, cucumbers after frost', 'Harvest ramps before they die back', 'Plant out hardened perennial herbs', 'Spring food forest tour: note what\'s working' ],
  5:  [ 'Full summer succession: stagger bean sowings', 'Elderflower harvest (early June)', 'Begin pinching and pruning vigorous shrubs', 'Cultivate and mulch heavily to conserve moisture', 'Monitor for cucumber beetles and squash vine borer', 'Water deeply during dry spells — focus on newly planted trees' ],
  6:  [ 'Harvest garlic when tops begin to yellow', 'Currant and gooseberry picking begins', 'Deadhead herbs to extend production', 'Summer sow for fall crops: kale, broccoli, beets', 'Prune out water sprouts from apple trees', 'Check and adjust irrigation for food forest planting' ],
  7:  [ 'Blueberry harvest continues through August', 'Preserve summer abundance: freeze, ferment, dry', 'Collect seeds from open-pollinated annuals', 'Late summer sow spinach and arugula for fall', 'Bird breeding season ends — resume louder activities', 'Plant cover crops in empty annual beds' ],
  8:  [ 'Nut harvest begins: hickory, hazelnut', 'Apple and pear harvest — taste daily to judge timing', 'Dig root crops: Jerusalem artichoke, skirret', 'Save seeds in earnest — dry thoroughly before storing', 'Plant fall garlic in prepared beds', 'Begin compost building from harvest residues' ],
  9:  [ 'Late apple and persimmon harvest', 'Plant spring-flowering bulbs', 'Final root vegetable harvest before hard frost', 'Divide and transplant perennials for propagation', 'Lay winter mulch around food forest trees', 'Continue seed saving — label and catalog everything' ],
  10: [ 'Plant bare-root trees and shrubs', 'Final cleanup of annual beds — add to compost', 'Spread compost on garden beds for winter incorporation', 'Prune elderberry hard if needed', 'Take cuttings of currants and gooseberries for propagation', 'Note what species performed well — update planting log' ],
  11: [ 'Review the season\'s notes and outcomes', 'Dormant pruning of fruit trees begins', 'Plan crop rotations for following year', 'Draft wishlist for seed orders', 'Repair and organize tools, store properly', 'Quiet observation — walk the food forest monthly' ]
};

function initGardenCalendar() {
  const canvas = document.getElementById('garden-calendar');
  if (!canvas || !canvas.getContext) return;

  const ctx       = canvas.getContext('2d');
  const SIZE      = canvas.width;           // 460
  const CX        = SIZE / 2;
  const CY        = SIZE / 2;
  const N         = 12;
  const SEG       = (2 * Math.PI) / N;
  // Start at top (−90°)
  const START_OFF = -Math.PI / 2;

  // Radii
  const R_INNER   = SIZE * 0.125;  // inner hub
  const R_BIRD    = SIZE * 0.195;  // bird band outer edge
  const R_MONTH   = SIZE * 0.38;   // month arcs outer edge
  const R_LABEL   = SIZE * 0.44;   // label ring
  const R_OUTER   = SIZE * 0.47;   // outer rim

  const currentMonth = new Date().getMonth(); // 0–11
  let   activeMonth  = currentMonth;

  const monthPanel  = document.getElementById('garden-panel-month');
  const itemsPanel  = document.getElementById('garden-panel-items');

  function renderPanel(m) {
    monthPanel.textContent = MONTHS[m];
    const tasks = GARDEN_TASKS[m] || [];
    itemsPanel.innerHTML = tasks.map(t => `<li>${t}</li>`).join('');
  }

  function draw(active) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // ── Month segments ──────────────────────────────────────
    for (let i = 0; i < N; i++) {
      const a0 = START_OFF + i * SEG;
      const a1 = a0 + SEG;
      const isActive  = i === active;
      const isCurrent = i === currentMonth;

      // Base season fill
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R_MONTH, a0, a1);
      ctx.closePath();
      ctx.fillStyle = getSeasonColor(i);
      ctx.globalAlpha = isActive ? 0.9 : 0.55;
      ctx.fill();

      // Active highlight ring around segment
      if (isActive) {
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, R_MONTH + 4, a0, a1);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(196, 136, 58, 0.7)';
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
      }

      // Current month tick mark (amber, inner rim)
      if (isCurrent) {
        const midA  = a0 + SEG / 2;
        const ix    = CX + (R_MONTH - 6) * Math.cos(midA);
        const iy    = CY + (R_MONTH - 6) * Math.sin(midA);
        const ix2   = CX + (R_MONTH - 14) * Math.cos(midA);
        const iy2   = CY + (R_MONTH - 14) * Math.sin(midA);
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix2, iy2);
        ctx.strokeStyle = '#c4883a';
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
      }

      // Segment divider lines
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(CX + R_INNER * Math.cos(a0), CY + R_INNER * Math.sin(a0));
      ctx.lineTo(CX + R_MONTH * Math.cos(a0), CY + R_MONTH * Math.sin(a0));
      ctx.strokeStyle = '#8a917a';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // ── Bird breeding band (May–Aug = 4, 5, 6, 7) ──────────
    // Draw as a ring segment from May start to Aug end
    const birdA0 = START_OFF + 4 * SEG;
    const birdA1 = START_OFF + 8 * SEG;

    ctx.beginPath();
    ctx.arc(CX, CY, R_BIRD,      birdA0, birdA1);
    ctx.arc(CX, CY, R_INNER + 2, birdA1, birdA0, true);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(139, 37, 0, 0.22)';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 37, 0, 0.45)';
    ctx.lineWidth   = 0.8;
    ctx.stroke();

    // Bird band label
    ctx.save();
    const birdMid = (birdA0 + birdA1) / 2;
    const labelR  = (R_INNER + R_BIRD) / 2;
    ctx.translate(CX + labelR * Math.cos(birdMid), CY + labelR * Math.sin(birdMid));
    ctx.rotate(birdMid + Math.PI / 2);
    ctx.font        = `${SIZE * 0.018}px 'Source Serif 4', serif`;
    ctx.fillStyle   = 'rgba(200, 80, 40, 0.65)';
    ctx.textAlign   = 'center';
    ctx.globalAlpha = 0.8;
    ctx.fillText('breeding', 0, 0);
    ctx.restore();

    // ── Month labels ────────────────────────────────────────
    ctx.globalAlpha = 1;
    for (let i = 0; i < N; i++) {
      const midA   = START_OFF + i * SEG + SEG / 2;
      const lx     = CX + R_LABEL * Math.cos(midA);
      const ly     = CY + R_LABEL * Math.sin(midA);
      const isAct  = i === activeMonth;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midA + Math.PI / 2);

      ctx.font      = `${SIZE * 0.032}px 'Source Serif 4', serif`;
      ctx.fillStyle = isAct ? '#e8e4dc' : '#8a917a';
      ctx.globalAlpha = isAct ? 0.95 : 0.6;
      ctx.textAlign = 'center';
      ctx.fillText(MONTHS[i].slice(0, 3).toUpperCase(), 0, 0);
      ctx.restore();
    }

    // ── Inner hub ───────────────────────────────────────────
    ctx.globalAlpha = 1;

    // Hub background
    ctx.beginPath();
    ctx.arc(CX, CY, R_INNER, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a08';
    ctx.fill();
    ctx.strokeStyle = 'rgba(138, 145, 122, 0.25)';
    ctx.lineWidth   = 0.8;
    ctx.stroke();

    // Season name in hub
    let seasonName = 'Season';
    for (const s of SEASONS) {
      if (s.months.includes(active)) { seasonName = s.name; break; }
    }
    ctx.font        = `italic ${SIZE * 0.04}px 'Cormorant Garamond', serif`;
    ctx.fillStyle   = 'rgba(232, 228, 220, 0.65)';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seasonName, CX, CY);
    ctx.textBaseline = 'alphabetic';

    // ── Outer rim circle ────────────────────────────────────
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUTER, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(138, 145, 122, 0.2)';
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── Hit detection ────────────────────────────────────────
  function getMonthFromPoint(x, y) {
    const dx = x - CX;
    const dy = y - CY;
    const dist = Math.hypot(dx, dy);

    if (dist < R_INNER || dist > R_OUTER) return -1;

    let angle = Math.atan2(dy, dx) - START_OFF;
    if (angle < 0) angle += Math.PI * 2;

    return Math.floor(angle / SEG) % N;
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const m = getMonthFromPoint(x, y);
    if (m < 0) return;

    activeMonth = m;
    draw(activeMonth);
    renderPanel(activeMonth);
  });

  // Initial render — show current month
  draw(activeMonth);
  renderPanel(activeMonth);
}

/* ============================================================
   Boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFoodForest();
  initGardenCalendar();
});

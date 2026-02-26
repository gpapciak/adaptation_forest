/**
 * Adaptation Forest — science.js
 * Climate projection chart · Species table sort · Carbon counters
 */

'use strict';

/* ============================================================
   Climate Projection Line Graph
   Canvas-based. Two scenario lines draw from left to right
   on scroll via IntersectionObserver + requestAnimationFrame.
   ============================================================ */

function initClimateChart() {
  const canvas = document.getElementById('climate-chart');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const W   = canvas.width;   // 900
  const H   = canvas.height;  // 360

  const PAD  = { top: 36, right: 72, bottom: 52, left: 62 };
  const cW   = W - PAD.left - PAD.right;
  const cH   = H - PAD.top  - PAD.bottom;

  // Northeastern US temperature projections above 1986–2015 baseline
  const LOW = [
    [2020, 1.0], [2030, 1.5], [2040, 2.0], [2050, 2.5],
    [2060, 2.8], [2070, 3.0], [2080, 3.1], [2090, 3.2], [2100, 3.4]
  ];

  const HIGH = [
    [2020, 1.0], [2030, 1.6], [2040, 2.5], [2050, 3.8],
    [2060, 5.2], [2070, 6.8], [2080, 8.2], [2090, 9.2], [2100, 10.0]
  ];

  const YEAR_MIN = 2020, YEAR_MAX = 2100;
  const TEMP_MIN = 0,    TEMP_MAX = 11;

  function toX(year) {
    return PAD.left + (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN) * cW;
  }

  function toY(temp) {
    return PAD.top + cH - (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN) * cH;
  }

  // Interpolate dataset to the clipped x position
  function clippedPoints(data, clipX) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const px = toX(data[i][0]);
      const py = toY(data[i][1]);
      if (px <= clipX) {
        result.push([px, py]);
      } else {
        if (i > 0) {
          const [x0, y0] = [toX(data[i - 1][0]), toY(data[i - 1][1])];
          const t = (clipX - x0) / (px - x0);
          result.push([clipX, y0 + t * (py - y0)]);
        }
        break;
      }
    }
    return result;
  }

  function render(progress) {
    const clipX = PAD.left + cW * progress;

    ctx.clearRect(0, 0, W, H);

    // ── Background ───────────────────────────────────────────
    ctx.fillStyle = '#060908';
    ctx.fillRect(0, 0, W, H);

    // ── Grid ─────────────────────────────────────────────────
    ctx.save();
    ctx.setLineDash([]);

    // Horizontal grid lines & Y labels
    [2, 4, 6, 8, 10].forEach(t => {
      const y = toY(t);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.strokeStyle = 'rgba(138, 145, 122, 0.10)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();

      ctx.fillStyle   = 'rgba(138, 145, 122, 0.45)';
      ctx.font        = `${W < 600 ? 9 : 11}px 'Source Serif 4', serif`;
      ctx.textAlign   = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${t}°F`, PAD.left - 8, y);
    });

    // Zero line label
    const y0 = toY(0);
    ctx.fillStyle = 'rgba(138, 145, 122, 0.3)';
    ctx.font      = `${W < 600 ? 9 : 10}px 'Source Serif 4', serif`;
    ctx.textAlign = 'right';
    ctx.fillText('baseline', PAD.left - 8, y0);

    // Vertical decade grid & X labels
    for (let yr = 2020; yr <= 2100; yr += 10) {
      const x = toX(yr);
      ctx.beginPath();
      ctx.moveTo(x, PAD.top);
      ctx.lineTo(x, H - PAD.bottom);
      ctx.strokeStyle = 'rgba(138, 145, 122, 0.08)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();

      ctx.fillStyle    = 'rgba(138, 145, 122, 0.45)';
      ctx.font         = `${W < 600 ? 9 : 11}px 'Source Serif 4', serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(yr.toString(), x, H - PAD.bottom + 10);
    }

    // Axis baseline
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, H - PAD.bottom);
    ctx.lineTo(W - PAD.right, H - PAD.bottom);
    ctx.strokeStyle = 'rgba(138, 145, 122, 0.22)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();

    // ── Data ─────────────────────────────────────────────────
    const lowPts  = clippedPoints(LOW,  clipX);
    const highPts = clippedPoints(HIGH, clipX);

    if (lowPts.length < 2 || highPts.length < 2) return;

    // Filled band between scenarios
    ctx.beginPath();
    ctx.moveTo(lowPts[0][0], lowPts[0][1]);
    lowPts.forEach(([x, y]) => ctx.lineTo(x, y));
    for (let i = highPts.length - 1; i >= 0; i--) {
      ctx.lineTo(highPts[i][0], highPts[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle   = 'rgba(196, 136, 58, 0.07)';
    ctx.globalAlpha = 1;
    ctx.fill();

    // Low scenario line (moss green)
    ctx.beginPath();
    ctx.moveTo(lowPts[0][0], lowPts[0][1]);
    lowPts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = 'rgba(74, 140, 74, 0.82)';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // High scenario line (amber)
    ctx.beginPath();
    ctx.moveTo(highPts[0][0], highPts[0][1]);
    highPts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = 'rgba(196, 136, 58, 0.82)';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // End-of-line labels (appear at full progress)
    if (progress >= 0.98) {
      const [lx, ly] = lowPts[lowPts.length - 1];
      ctx.fillStyle    = 'rgba(74, 140, 74, 0.82)';
      ctx.font         = `11px 'Source Serif 4', serif`;
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('+3.4°F', lx + 8, ly);

      const [hx, hy] = highPts[highPts.length - 1];
      ctx.fillStyle = 'rgba(196, 136, 58, 0.88)';
      ctx.fillText('+10°F', hx + 8, hy);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(14, PAD.top + cH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle    = 'rgba(138, 145, 122, 0.38)';
    ctx.font         = `10px 'Source Serif 4', serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Temperature change (°F)', 0, 0);
    ctx.restore();
  }

  let progress  = 0;
  let animating = false;

  function step() {
    progress = Math.min(1, progress + 0.007);
    render(progress);
    if (progress < 1) requestAnimationFrame(step);
    else animating = false;
  }

  render(0); // draw axes immediately

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animating) {
      animating = true;
      step();
      obs.disconnect();
    }
  }, { threshold: 0.15 });

  obs.observe(canvas);
}

/* ============================================================
   Species Table — Sortable
   Click column headers to sort. Values: Good > Fair > Poor.
   ============================================================ */

function initSpeciesTable() {
  const table = document.getElementById('species-table');
  if (!table) return;

  const RATING = { 'Good': 3, 'Fair': 2, 'Poor': 1 };
  let sortCol = null;
  let sortDir = 1;

  const headers = table.querySelectorAll('th.sortable');

  function sortTable(col) {
    const tbody = table.querySelector('tbody');
    const rows  = Array.from(tbody.querySelectorAll('tr'));

    // Toggle or set direction
    if (sortCol === col) {
      sortDir *= -1;
    } else {
      sortCol = col;
      // Species: A→Z first; ratings: Good→Poor first (descending numeric)
      sortDir = (col === 'species') ? 1 : -1;
    }

    rows.sort((a, b) => {
      const va = a.getAttribute(`data-${col}`) || '';
      const vb = b.getAttribute(`data-${col}`) || '';
      if (col === 'species') {
        return sortDir * va.localeCompare(vb);
      }
      return sortDir * ((RATING[va] || 0) - (RATING[vb] || 0));
    });

    rows.forEach(r => tbody.appendChild(r));

    // Update header arrow indicators
    headers.forEach(th => {
      const arrow = th.querySelector('.sort-arrow');
      th.classList.remove('sort-asc', 'sort-desc');
      if (arrow) { arrow.classList.remove('asc', 'desc'); arrow.textContent = '↕'; }
    });

    const activeHeader = table.querySelector(`[data-col="${col}"]`);
    if (activeHeader) {
      const arrow = activeHeader.querySelector('.sort-arrow');
      if (sortDir > 0) {
        activeHeader.classList.add('sort-asc');
        if (arrow) { arrow.classList.add('asc'); arrow.textContent = '↑'; }
      } else {
        activeHeader.classList.add('sort-desc');
        if (arrow) { arrow.classList.add('desc'); arrow.textContent = '↓'; }
      }
    }
  }

  headers.forEach(th => {
    th.addEventListener('click', () => sortTable(th.getAttribute('data-col')));
  });
}

/* ============================================================
   Carbon Pool Counters
   Count up from 0 to target value when section scrolls in.
   ============================================================ */

function initCarbonCounters() {
  const section = document.getElementById('carbon');
  if (!section) return;

  const counters = section.querySelectorAll('.counter');
  if (!counters.length) return;

  let triggered = false;

  function countUp() {
    counters.forEach(el => {
      const target   = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1400;
      const steps    = 50;
      const interval = duration / steps;
      let   step     = 0;

      const timer = setInterval(() => {
        step++;
        const easedT  = 1 - Math.pow(1 - step / steps, 3); // cubic ease-out
        el.textContent = Math.round(easedT * target);
        if (step >= steps) {
          el.textContent = target;
          clearInterval(timer);
        }
      }, interval);
    });
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      countUp();
      obs.disconnect();
    }
  }, { threshold: 0.25 });

  obs.observe(section);
}

/* ============================================================
   Boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initClimateChart();
  initSpeciesTable();
  initCarbonCounters();
});

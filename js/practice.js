/**
 * Adaptation Forest — practice.js
 * Seasonal calendar wheel + practice-page interactivity
 */

'use strict';

/* ============================================================
   Seasonal Calendar Wheel
   12 arc segments, colour-coded by season.
   Bird breeding restriction band: May–Aug (cardinal).
   Click segment → task panel updates.
   ============================================================ */

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const SEASONS = [
  { name: 'Winter',  months: [0, 1, 11], color: '#2a3a4a' },
  { name: 'Spring',  months: [2, 3, 4],  color: '#2d4a2d' },
  { name: 'Summer',  months: [5, 6, 7],  color: '#3a4a1a' },
  { name: 'Autumn',  months: [8, 9, 10], color: '#4a3010' }
];

// Tasks per month (abbreviated)
const MONTH_TASKS = {
  0:  ['Firewood inventory & restock', 'Check water line insulation', 'Seed catalogue review', 'Tool maintenance & sharpening'],
  1:  ['Tap sugar maples (late Feb)', 'Plan spring plantings', 'Inspect roof & solar panels after ice', 'Order seeds'],
  2:  ['Start indoor seedlings', 'Clear storm debris from trails', 'Maple syrup finishing', 'Assess winter damage to plantings'],
  3:  ['Spring planting begins', 'Trail maintenance season opens', 'Compost turning', 'Wildflower survey'],
  4:  ['Direct-sow outdoors', 'Bird breeding season begins — limit clearing work', 'Mushroom inoculation (logs)', 'Water system inspection'],
  5:  ['Weed management in garden', 'Bird breeding restriction in effect', 'Solar peak — battery check', 'Harvest early greens'],
  6:  ['Midsummer harvest', 'Bird breeding restriction in effect', 'Irrigation monitoring', 'Fire risk assessment'],
  7:  ['Bulk harvest & preservation', 'Bird breeding season ends late Aug', 'Late summer planting (fall crops)', 'Forest walk & species survey'],
  8:  ['Seed saving', 'Mushroom harvest peak', 'Firewood cutting begins', 'Trail clearing before leaf drop'],
  9:  ['Root vegetable harvest', 'Final firewood stacking', 'Garlic planting', 'Tree ring & growth observation'],
  10: ['Winterize water system', 'Mulch garden beds', 'Equipment storage & weatherproofing', 'Wildlife corridor check'],
  11: ['Solstice gathering', 'Year-end inventory', 'Planning next season', 'Repair & reflection']
};

function getSeasonForMonth(monthIndex) {
  return SEASONS.find(s => s.months.includes(monthIndex));
}

function initSeasonalCalendar() {
  const canvas = document.getElementById('seasonal-calendar');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;
  const cx  = W / 2;
  const cy  = H / 2;

  const outerR   = cx * 0.88;
  const innerR   = cx * 0.52;
  const breedR   = cx * 0.46; // bird breeding band inner radius
  const labelR   = (outerR + innerR) / 2;
  const segCount = 12;
  const segAngle = (Math.PI * 2) / segCount;

  // Rotate so January starts at top (−π/2)
  const startOffset = -Math.PI / 2;

  // Bird breeding months: May(4)–Aug(7)
  const breedMonths = new Set([4, 5, 6, 7]);

  let selectedMonth = null;

  // ── Parse colours from CSS variables ──────────────────────
  const style     = getComputedStyle(document.documentElement);
  const clrHumus  = style.getPropertyValue('--clr-humus').trim()  || '#0a0a08';
  const clrLichen = style.getPropertyValue('--clr-lichen').trim() || '#8a917a';
  const clrAmber  = style.getPropertyValue('--clr-amber').trim()  || '#c4883a';
  const clrBirch  = style.getPropertyValue('--clr-birch').trim()  || '#e8e4dc';
  const clrCard   = style.getPropertyValue('--clr-cardinal').trim() || '#8b2500';
  const clrMoss   = style.getPropertyValue('--clr-moss').trim()   || '#2d4a2d';

  function draw(active) {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < segCount; i++) {
      const a0 = startOffset + i * segAngle;
      const a1 = a0 + segAngle;

      const season   = getSeasonForMonth(i);
      const isActive = (i === active);
      const isBird   = breedMonths.has(i);

      // Outer segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, a0, a1);
      ctx.closePath();
      ctx.fillStyle = isActive ? clrAmber : season.color;
      ctx.globalAlpha = isActive ? 0.85 : 0.45;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Segment border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, a0, a1);
      ctx.closePath();
      ctx.strokeStyle = clrHumus;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bird breeding band (arc ring between breedR and innerR)
      if (isBird) {
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, a0 + 0.04, a1 - 0.04);
        ctx.arc(cx, cy, breedR, a1 - 0.04, a0 + 0.04, true);
        ctx.closePath();
        ctx.fillStyle = clrCard;
        ctx.globalAlpha = isActive ? 0.55 : 0.30;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Month label
      const midAngle = a0 + segAngle / 2;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.textAlign  = 'center';
      ctx.textBaseline = 'middle';
      ctx.font       = isActive
        ? `bold ${Math.round(W * 0.035)}px "Source Serif 4", serif`
        : `${Math.round(W * 0.032)}px "Source Serif 4", serif`;
      ctx.fillStyle  = isActive ? clrHumus : clrBirch;
      ctx.globalAlpha = isActive ? 1 : 0.75;
      ctx.fillText(MONTHS[i].substring(0, 3).toUpperCase(), 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Inner circle (centre hub)
    ctx.beginPath();
    ctx.arc(cx, cy, breedR, 0, Math.PI * 2);
    ctx.fillStyle = clrHumus;
    ctx.fill();
    ctx.strokeStyle = clrLichen;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Centre text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (active !== null) {
      const season = getSeasonForMonth(active);
      ctx.font     = `italic ${Math.round(W * 0.04)}px "Cormorant Garamond", serif`;
      ctx.fillStyle = clrAmber;
      ctx.fillText(season.name, cx, cy - 10);
      ctx.font     = `${Math.round(W * 0.032)}px "Source Serif 4", serif`;
      ctx.fillStyle = clrLichen;
      ctx.globalAlpha = 0.7;
      ctx.fillText(MONTHS[active], cx, cy + 12);
      ctx.globalAlpha = 1;
    } else {
      ctx.font     = `italic ${Math.round(W * 0.038)}px "Cormorant Garamond", serif`;
      ctx.fillStyle = clrLichen;
      ctx.globalAlpha = 0.55;
      ctx.fillText('select', cx, cy - 8);
      ctx.fillText('month', cx, cy + 10);
      ctx.globalAlpha = 1;
    }

    // Bird breeding legend arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 14, startOffset + 4 * segAngle, startOffset + 8 * segAngle);
    ctx.strokeStyle = clrCard;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Bird breeding legend label
    const legendAngle = startOffset + 6 * segAngle;
    const lx2 = cx + Math.cos(legendAngle) * (outerR + 26);
    const ly2 = cy + Math.sin(legendAngle) * (outerR + 26);
    ctx.save();
    ctx.translate(lx2, ly2);
    ctx.rotate(legendAngle + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = `${Math.round(W * 0.026)}px "Source Serif 4", serif`;
    ctx.fillStyle = clrCard;
    ctx.globalAlpha = 0.6;
    ctx.fillText('bird breeding — limit clearing', 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function updatePanel(monthIndex) {
    const panel      = document.getElementById('calendar-panel');
    const panelMonth = document.getElementById('panel-month');
    const panelList  = document.getElementById('panel-tasks');
    if (!panel || !panelMonth || !panelList) return;

    if (monthIndex === null) {
      panelMonth.textContent = 'Select a month';
      panelList.innerHTML = '<li>Click a segment to see seasonal tasks.</li>';
      return;
    }

    panelMonth.textContent = MONTHS[monthIndex];
    const tasks = MONTH_TASKS[monthIndex] || [];
    panelList.innerHTML = tasks.map(t => `<li>${t}</li>`).join('');
  }

  function getMonthFromPoint(x, y) {
    const dx  = x - cx;
    const dy  = y - cy;
    const r   = Math.sqrt(dx * dx + dy * dy);
    if (r < breedR || r > outerR) return null;

    let angle = Math.atan2(dy, dx) - startOffset;
    if (angle < 0) angle += Math.PI * 2;
    return Math.floor(angle / segAngle) % 12;
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const month = getMonthFromPoint(x, y);
    if (month === null) return;

    selectedMonth = (selectedMonth === month) ? null : month;
    draw(selectedMonth);
    updatePanel(selectedMonth);
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const month = getMonthFromPoint(x, y);
    canvas.style.cursor = month !== null ? 'pointer' : 'default';
  });

  // Initial render
  draw(selectedMonth);
  updatePanel(selectedMonth);
}

document.addEventListener('DOMContentLoaded', () => {
  initSeasonalCalendar();
});

/**
 * Adaptation Forest — art.js
 * Leaf spiral generation · Interactive light canvas
 */

'use strict';

/* ============================================================
   Leaf Spiral
   Archimedean spiral of 55 leaves, generated into SVG,
   animated with staggered opacity on scroll.
   ============================================================ */

function buildLeafSpiral() {
  const container = document.getElementById('leaf-spiral-svg');
  if (!container) return;

  const ns   = 'http://www.w3.org/2000/svg';
  const SIZE = 640;
  const cx   = SIZE / 2;
  const cy   = SIZE / 2;

  // Archimedean spiral: r = a * θ
  const a          = 9;
  const N          = 55;
  const thetaStart = 0.45;
  const thetaEnd   = 4.9 * Math.PI;   // ~2.45 rotations
  const thetaStep  = (thetaEnd - thetaStart) / (N - 1);

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute('class', 'leaf-spiral-svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');

  const groups = [];

  for (let i = 0; i < N; i++) {
    const theta = thetaStart + i * thetaStep;
    const r     = a * theta;

    // Position: offset by −π/2 so the spiral starts at the top
    const x = cx + r * Math.cos(theta - Math.PI / 2);
    const y = cy + r * Math.sin(theta - Math.PI / 2);

    // Leaf size scales with distance from centre
    const leafLen = Math.max(6, Math.min(26, 5.5 + r * 0.112));
    const w       = leafLen * 0.40;
    const hl      = leafLen / 2;

    // Rotation: tangent to spiral in SVG coordinate space
    const rotDeg = theta * (180 / Math.PI);

    // Group — starts transparent, transitions to opacity 1
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform',
      `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${rotDeg.toFixed(1)})`);
    g.style.opacity         = '0';
    g.style.transition      = 'opacity 0.75s ease';
    g.style.transitionDelay = `${(i * 0.046).toFixed(3)}s`;

    // Leaf outline — symmetric bezier, pointed at both ends
    const d = [
      `M 0 ${hl.toFixed(2)}`,
      `C ${(-w).toFixed(2)} ${(hl / 2).toFixed(2)}`,
      `  ${(-w).toFixed(2)} ${(-hl / 2).toFixed(2)}`,
      `  0 ${(-hl).toFixed(2)}`,
      `C ${w.toFixed(2)} ${(-hl / 2).toFixed(2)}`,
      `  ${w.toFixed(2)} ${(hl / 2).toFixed(2)}`,
      `  0 ${hl.toFixed(2)} Z`,
    ].join(' ');

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '0.9');
    path.setAttribute('class', 'leaf-outline');

    // Midrib
    const midrib = document.createElementNS(ns, 'line');
    midrib.setAttribute('x1', '0');
    midrib.setAttribute('y1', hl.toFixed(2));
    midrib.setAttribute('x2', '0');
    midrib.setAttribute('y2', (-hl).toFixed(2));
    midrib.setAttribute('stroke-width', '0.5');
    midrib.setAttribute('class', 'leaf-midrib');

    g.appendChild(path);
    g.appendChild(midrib);

    // Secondary veins — appear on leaves large enough to show them
    if (leafLen > 12) {
      const veinCount = leafLen > 19 ? 3 : 2;
      for (let v = 1; v <= veinCount; v++) {
        const vt   = v / (veinCount + 1);
        const vy   = hl - vt * leafLen;
        const vLen = w * (0.45 + 0.38 * Math.sin(vt * Math.PI));

        for (const side of [-1, 1]) {
          const vein = document.createElementNS(ns, 'line');
          vein.setAttribute('x1', '0');
          vein.setAttribute('y1', vy.toFixed(2));
          vein.setAttribute('x2', (side * vLen).toFixed(2));
          vein.setAttribute('y2', (vy - vLen * 0.44).toFixed(2));
          vein.setAttribute('stroke-width', '0.4');
          vein.setAttribute('class', 'leaf-vein');
          g.appendChild(vein);
        }
      }
    }

    svg.appendChild(g);
    groups.push(g);
  }

  container.appendChild(svg);

  // Trigger staggered fade-in when the container enters the viewport
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      groups.forEach(g => { g.style.opacity = '1'; });
      obs.disconnect();
    }
  }, { threshold: 0.12 });

  obs.observe(container);
}

/* ============================================================
   Interactive Light Canvas
   Click/tap to place warm radial light sources on a dark
   forest-night background. Lights fade over ~9 seconds.
   ============================================================ */

function initLightCanvas() {
  const canvas = document.getElementById('light-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx    = canvas.getContext('2d');
  const lights = [];           // { x, y, born }
  const MAX    = 12;           // max simultaneous lights
  const FADE   = 9000;         // ms until fully faded
  let   animId = null;

  // Fit canvas to its rendered width while keeping 2:1 ratio
  function resize() {
    const w = canvas.parentElement
      ? Math.min(canvas.parentElement.clientWidth, 820)
      : 820;
    canvas.width  = w;
    canvas.height = Math.round(w * 0.5);
  }
  resize();

  // ── Draw loop ──────────────────────────────────────────────
  function drawFrame() {
    const W   = canvas.width;
    const H   = canvas.height;
    const now = Date.now();

    // Night sky — deep forest green-black
    ctx.fillStyle = '#050907';
    ctx.fillRect(0, 0, W, H);

    // Evict expired lights
    while (lights.length && now - lights[0].born > FADE) lights.shift();

    // Subtle vertical tree-trunk marks (drawn once per frame, very faint)
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#8a917a';
    ctx.lineWidth   = 1;
    const trunkX = [0.08, 0.19, 0.27, 0.41, 0.55, 0.68, 0.79, 0.91].map(f => f * W);
    trunkX.forEach(tx => {
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx, H);
      ctx.stroke();
    });
    ctx.restore();

    // Canopy silhouette band at top — just a slightly darker strip
    const canopy = ctx.createLinearGradient(0, 0, 0, H * 0.28);
    canopy.addColorStop(0, 'rgba(3, 5, 3, 0.55)');
    canopy.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = canopy;
    ctx.fillRect(0, 0, W, H * 0.28);

    // Draw each light source
    const baseR = (W / 820) * 110; // scale radius to canvas size
    lights.forEach(light => {
      const age   = (now - light.born) / FADE;
      const alpha = Math.max(0, 1 - age * age); // quadratic ease-out

      const grad = ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, baseR
      );
      grad.addColorStop(0,    `rgba(230, 168, 72,  ${0.85 * alpha})`);
      grad.addColorStop(0.12, `rgba(210, 148, 58,  ${0.70 * alpha})`);
      grad.addColorStop(0.35, `rgba(160, 108, 42,  ${0.35 * alpha})`);
      grad.addColorStop(0.65, `rgba(90,   60, 22,  ${0.14 * alpha})`);
      grad.addColorStop(1,    'rgba(0,   0,   0,  0)');

      ctx.beginPath();
      ctx.arc(light.x, light.y, baseR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    animId = requestAnimationFrame(drawFrame);
  }

  // ── Place a light at canvas coordinates ───────────────────
  function placeLight(clientX, clientY) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top)  * scaleY;

    if (lights.length >= MAX) lights.shift();
    lights.push({ x, y, born: Date.now() });
  }

  canvas.addEventListener('click', e => placeLight(e.clientX, e.clientY));

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    placeLight(t.clientX, t.clientY);
  }, { passive: false });

  // Clear button
  const clearBtn = document.getElementById('light-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => { lights.length = 0; });
  }

  // ── Start / pause loop with visibility ────────────────────
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) drawFrame();
    } else {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  }, { threshold: 0.05 });

  obs.observe(canvas);
}

/* ============================================================
   Botanical Mandala — Kathy Klein / danmala section
   Generates a 600×600 SVG inside #mandala-svg.
   Six concentric rings (each a <g class="mandala-ring">) start
   slightly rotated and invisible; an IntersectionObserver adds
   .mandala--assembled to the SVG, triggering CSS transitions
   that spin each ring to 0° and fade it in with its own delay.
   ============================================================ */

function buildMandala() {
  const container = document.getElementById('mandala-svg');
  if (!container) return;

  const ns   = 'http://www.w3.org/2000/svg';
  const SIZE = 600;
  const CX   = SIZE / 2;   // 300
  const CY   = SIZE / 2;   // 300

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute('class', 'mandala-svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  container.appendChild(svg);

  // Root group — everything relative to mandala centre
  const root = document.createElementNS(ns, 'g');
  root.setAttribute('transform', `translate(${CX},${CY})`);
  svg.appendChild(root);

  // ── Helper: make a SVG element with class + attrs ─────────
  function el(tag, cls, attrs) {
    const e = document.createElementNS(ns, tag);
    if (cls) e.setAttribute('class', cls);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  // ── Helper: leaf shape (symmetric bezier, pointed ends) ───
  function leafPath(len, wRatio) {
    const hl = len / 2;
    const w  = len * wRatio;
    return [
      `M 0 ${hl.toFixed(2)}`,
      `C ${(-w).toFixed(2)} ${(hl / 2).toFixed(2)}`,
      `  ${(-w).toFixed(2)} ${(-hl / 2).toFixed(2)}`,
      `  0 ${(-hl).toFixed(2)}`,
      `C ${w.toFixed(2)} ${(-hl / 2).toFixed(2)}`,
      `  ${w.toFixed(2)} ${(hl / 2).toFixed(2)}`,
      `  0 ${hl.toFixed(2)} Z`,
    ].join(' ');
  }

  // Track ring groups — scroll handler reveals them one by one
  const rings = [];

  // ── Helper: make a ring <g> with animation setup ──────────
  // No transition delay — scroll position controls which ring fires next.
  // The CSS transition handles the smooth rotate-in for each ring.
  function makeRing(rotOff) {
    const g = document.createElementNS(ns, 'g');
    g.style.opacity    = '0';
    g.style.transition = 'opacity 0.85s ease, transform 1.05s cubic-bezier(0.22,0.8,0.42,1)';
    if (rotOff) g.style.transform = `rotate(${rotOff}deg)`;
    root.appendChild(g);
    rings.push(g);
    return g;
  }

  // ── Ring 0: Centre flower ──────────────────────────────────
  {
    const g = makeRing(0);
    // Small amber centre dot
    g.appendChild(el('circle', 'mandala-center-dot', { r: '4', cx: '0', cy: '0' }));
    // 6 petals
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const r = 22;
      const px = (r * Math.sin(angle)).toFixed(2);
      const py = (-r * Math.cos(angle)).toFixed(2);
      const pg = document.createElementNS(ns, 'g');
      pg.setAttribute('transform', `translate(${px},${py}) rotate(${i * 60})`);
      const petal = el('path', 'mandala-center', {
        d: leafPath(24, 0.38),
        'stroke-width': '1',
      });
      pg.appendChild(petal);
      g.appendChild(pg);
    }
    // Outer ring of centre
    g.appendChild(el('circle', 'mandala-center', {
      cx: '0', cy: '0', r: '42', 'stroke-width': '0.7',
    }));
  }

  // ── Ring 1: 8 leaves at r=72 ──────────────────────────────
  {
    const g = makeRing(-7);
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const r      = 72;
      const px     = (r * Math.sin(angle)).toFixed(2);
      const py     = (-r * Math.cos(angle)).toFixed(2);
      const rotDeg = (i / count * 360).toFixed(1);
      const lg = document.createElementNS(ns, 'g');
      lg.setAttribute('transform', `translate(${px},${py}) rotate(${rotDeg})`);

      const leafLen = 28;
      const hl      = leafLen / 2;
      const w       = leafLen * 0.32;

      lg.appendChild(el('path', 'mandala-leaf', {
        d: leafPath(leafLen, 0.32),
        'stroke-width': '0.95',
      }));
      lg.appendChild(el('line', 'mandala-midrib', {
        x1: '0', y1: `${hl}`, x2: '0', y2: `${-hl}`, 'stroke-width': '0.5',
      }));
      // Two veins per side
      [0.35, 0.65].forEach(vt => {
        const vy   = hl - vt * leafLen;
        const vLen = w * (0.45 + 0.38 * Math.sin(vt * Math.PI));
        [-1, 1].forEach(side => {
          lg.appendChild(el('line', 'mandala-vein', {
            x1: '0', y1: vy.toFixed(2),
            x2: (side * vLen).toFixed(2), y2: (vy - vLen * 0.44).toFixed(2),
            'stroke-width': '0.4',
          }));
        });
      });

      g.appendChild(lg);
    }
  }

  // ── Ring 2: 16 petals at r=115 ────────────────────────────
  {
    const g = makeRing(11);
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const r      = 115;
      const px     = (r * Math.sin(angle)).toFixed(2);
      const py     = (-r * Math.cos(angle)).toFixed(2);
      const rotDeg = (i / count * 360).toFixed(1);
      const pg     = document.createElementNS(ns, 'g');
      pg.setAttribute('transform', `translate(${px},${py}) rotate(${rotDeg})`);
      pg.appendChild(el('path', 'mandala-petal', {
        d: leafPath(20, 0.30),
        'stroke-width': '0.8',
      }));
      g.appendChild(pg);
    }
    // Dashed reference circle
    g.appendChild(el('circle', 'mandala-border', {
      cx: '0', cy: '0', r: '130',
      'stroke-width': '0.5', 'stroke-dasharray': '2 5',
    }));
  }

  // ── Ring 3: 8 botanical sprigs at r=158 ───────────────────
  {
    const g = makeRing(-10);
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const r      = 158;
      const px     = (r * Math.sin(angle)).toFixed(2);
      const py     = (-r * Math.cos(angle)).toFixed(2);
      const rotDeg = (i / count * 360).toFixed(1);
      const sg     = document.createElementNS(ns, 'g');
      sg.setAttribute('transform', `translate(${px},${py}) rotate(${rotDeg})`);

      // Stem
      sg.appendChild(el('line', 'mandala-sprig-stem', {
        x1: '0', y1: '14', x2: '0', y2: '-14', 'stroke-width': '0.75',
      }));
      // Two side leaves
      [{ t: -3, ang: -38 }, { t: 3, ang: 38 }].forEach(({ t, ang }) => {
        const slg = document.createElementNS(ns, 'g');
        slg.setAttribute('transform', `translate(0,${t}) rotate(${ang})`);
        slg.appendChild(el('path', 'mandala-sprig-leaf', {
          d: leafPath(10, 0.35),
          'stroke-width': '0.7',
        }));
        sg.appendChild(slg);
      });
      // Terminal bud (small leaf)
      const bg = document.createElementNS(ns, 'g');
      bg.setAttribute('transform', 'translate(0,-14)');
      bg.appendChild(el('path', 'mandala-sprig-bud', {
        d: leafPath(8, 0.30),
        'stroke-width': '0.65',
      }));
      sg.appendChild(bg);

      g.appendChild(sg);
    }
  }

  // ── Ring 4: 24 seed ellipses at r=198 ─────────────────────
  {
    const g = makeRing(8);
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const r      = 198;
      const px     = (r * Math.sin(angle)).toFixed(2);
      const py     = (-r * Math.cos(angle)).toFixed(2);
      const rotDeg = (i / count * 360).toFixed(1);
      const eg     = document.createElementNS(ns, 'g');
      eg.setAttribute('transform', `translate(${px},${py}) rotate(${rotDeg})`);
      eg.appendChild(el('ellipse', 'mandala-seed', {
        cx: '0', cy: '0', rx: '3.5', ry: '6.5', 'stroke-width': '0.7',
      }));
      // Tiny notch line (seed crease)
      eg.appendChild(el('line', 'mandala-seed', {
        x1: '0', y1: '-3', x2: '0', y2: '3', 'stroke-width': '0.35',
      }));
      g.appendChild(eg);
    }
  }

  // ── Ring 5: 12 leaves at r=235 ────────────────────────────
  {
    const g = makeRing(-6);
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const r      = 235;
      const px     = (r * Math.sin(angle)).toFixed(2);
      const py     = (-r * Math.cos(angle)).toFixed(2);
      const rotDeg = (i / count * 360).toFixed(1);
      const lg     = document.createElementNS(ns, 'g');
      lg.setAttribute('transform', `translate(${px},${py}) rotate(${rotDeg})`);

      const leafLen = 26;
      const hl      = leafLen / 2;
      const w       = leafLen * 0.31;

      lg.appendChild(el('path', 'mandala-leaf', {
        d: leafPath(leafLen, 0.31),
        'stroke-width': '0.9',
      }));
      lg.appendChild(el('line', 'mandala-midrib', {
        x1: '0', y1: `${hl}`, x2: '0', y2: `${-hl}`, 'stroke-width': '0.45',
      }));
      [0.32, 0.60].forEach(vt => {
        const vy   = hl - vt * leafLen;
        const vLen = w * (0.42 + 0.36 * Math.sin(vt * Math.PI));
        [-1, 1].forEach(side => {
          lg.appendChild(el('line', 'mandala-vein', {
            x1: '0', y1: vy.toFixed(2),
            x2: (side * vLen).toFixed(2), y2: (vy - vLen * 0.44).toFixed(2),
            'stroke-width': '0.35',
          }));
        });
      });

      g.appendChild(lg);
    }
  }

  // ── Border: two concentric circles ────────────────────────
  {
    const g = makeRing(0);
    g.appendChild(el('circle', 'mandala-border', {
      cx: '0', cy: '0', r: '268', 'stroke-width': '0.6',
    }));
    g.appendChild(el('circle', 'mandala-border', {
      cx: '0', cy: '0', r: '274', 'stroke-width': '0.35',
    }));
  }

  // ── Scroll-driven reveal ───────────────────────────────────
  // Progress 0 → top of container at viewport bottom (just visible).
  // Progress 1 → top of container at 28% from viewport top (well in view).
  // Each of the 7 rings reveals as progress crosses its threshold.
  let revealed = -1;

  function scrollProgress() {
    const rect = container.getBoundingClientRect();
    const vh   = window.innerHeight;
    return Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.72)));
  }

  function revealRings() {
    const prog    = scrollProgress();
    const target  = Math.min(rings.length - 1, Math.floor(prog * rings.length));
    if (target <= revealed) return;
    for (let i = revealed + 1; i <= target; i++) {
      rings[i].style.opacity   = '1';
      rings[i].style.transform = 'rotate(0deg)';
    }
    revealed = target;
    if (revealed >= rings.length - 1) {
      window.removeEventListener('scroll', revealRings, { passive: true });
    }
  }

  window.addEventListener('scroll', revealRings, { passive: true });
  revealRings(); // catch case where element is already in view on load
}

/* ============================================================
   Boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  buildLeafSpiral();
  buildMandala();
  initLightCanvas();
});

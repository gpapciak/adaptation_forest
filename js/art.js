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
   Boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  buildLeafSpiral();
  initLightCanvas();
});

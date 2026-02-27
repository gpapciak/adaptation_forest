/**
 * Adaptation Forest — Ambient Audio Player
 * Small fixed player (bottom-right) cycling through nature recordings.
 *
 * Planned: stream.mp3, wind-hardwoods.mp3,
 * wind-softwoods.mp3, rain-canopy.mp3, night.mp3
 */

'use strict';

(function () {

  // ── Playlist ───────────────────────────────────────────────────
  // Add future tracks here as { file, label } objects.
  // When more than one track is present the player crossfades
  // between them automatically; with one track it loops seamlessly.
  //
  // Planned: stream.mp3, wind-hardwoods.mp3,
  // wind-softwoods.mp3, rain-canopy.mp3, night.mp3
  const PLAYLIST = [
    { file: 'AF - Birds - May 2025.mp4', label: 'Spring Birds' },
  ];

  const CROSSFADE_S  = 3;     // crossfade duration in seconds
  const INIT_VOLUME  = 0.30;  // starting volume 0–1
  const SCROLL_STEP  = 0.05;  // volume change per scroll notch
  const FADE_TICK_MS = 40;    // ms between crossfade volume steps

  // ── Path resolution ────────────────────────────────────────────
  // pages/ files are one level deeper than the site root.
  const AUDIO_BASE = window.location.pathname.includes('/pages/')
    ? '../assets/audio/'
    : 'assets/audio/';

  // ── State ──────────────────────────────────────────────────────
  let currentIdx  = 0;
  let volume      = INIT_VOLUME;
  let playing     = false;
  let crossfading = false;

  // Two Audio elements: swap roles during crossfade so there is
  // always a smooth handoff between tracks.
  const audios = [new Audio(), new Audio()];
  let   active = 0;   // index into audios[] for the currently playing track

  function inactive() { return 1 - active; }

  function loadTrack(slotIdx, trackIdx) {
    const a   = audios[slotIdx];
    a.src     = AUDIO_BASE + PLAYLIST[trackIdx].file;
    a.volume  = 0;
    a.preload = 'auto';
    a.loop    = PLAYLIST.length === 1;
    a.load();
  }

  // ── DOM builder ────────────────────────────────────────────────
  function buildPlayer() {
    // Static HTML comment visible in browser dev tools inspector
    document.body.appendChild(document.createComment(
      ' The forest has been making this music for longer than\n' +
      '     humans have had ears to hear it. Press play to tend\n' +
      '     your attention for a moment. '
    ));

    const wrap = document.createElement('div');
    wrap.id        = 'ambient-player';
    wrap.className = 'ambient-player';
    wrap.setAttribute('aria-label', 'Ambient forest sounds player');

    const btn = document.createElement('button');
    btn.id        = 'ambient-btn';
    btn.className = 'ambient-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Play forest sounds');

    // Symmetrical waveform icon — five bars, tallest at centre
    btn.innerHTML =
      '<svg class="ambient-icon" viewBox="0 0 20 16" aria-hidden="true">' +
        '<rect x="0"    y="6"  width="2" height="4"  rx="1" fill="currentColor"/>' +
        '<rect x="4.5"  y="3"  width="2" height="10" rx="1" fill="currentColor"/>' +
        '<rect x="9"    y="0"  width="2" height="16" rx="1" fill="currentColor"/>' +
        '<rect x="13.5" y="3"  width="2" height="10" rx="1" fill="currentColor"/>' +
        '<rect x="18"   y="6"  width="2" height="4"  rx="1" fill="currentColor"/>' +
      '</svg>';

    const label = document.createElement('span');
    label.id        = 'ambient-label';
    label.className = 'ambient-label';
    label.textContent = 'Forest Sounds';

    wrap.appendChild(btn);
    wrap.appendChild(label);
    document.body.appendChild(wrap);
  }

  // ── UI ─────────────────────────────────────────────────────────
  function updateUI() {
    const wrap  = document.getElementById('ambient-player');
    const label = document.getElementById('ambient-label');
    const btn   = document.getElementById('ambient-btn');
    if (!wrap) return;

    if (playing) {
      wrap.classList.add('is-playing');
      label.textContent = PLAYLIST[currentIdx].label;
      btn.setAttribute('aria-label', 'Pause forest sounds');
    } else {
      wrap.classList.remove('is-playing');
      label.textContent = 'Forest Sounds';
      btn.setAttribute('aria-label', 'Play forest sounds');
    }
  }

  // ── Crossfade (multi-track) ────────────────────────────────────
  function crossfadeTo(nextTrackIdx) {
    if (crossfading) return;
    crossfading = true;

    const outAudio = audios[active];
    const inSlot   = inactive();
    loadTrack(inSlot, nextTrackIdx);
    const inAudio  = audios[inSlot];
    const startVol = outAudio.volume;
    const steps    = Math.round((CROSSFADE_S * 1000) / FADE_TICK_MS);
    let   step     = 0;

    inAudio.play().catch(() => {});

    const tick = setInterval(() => {
      step++;
      const t = step / steps;
      outAudio.volume = Math.max(0, startVol * (1 - t));
      inAudio.volume  = Math.min(volume, volume * t);

      if (step >= steps) {
        clearInterval(tick);
        outAudio.pause();
        outAudio.currentTime = 0;
        active      = inSlot;
        currentIdx  = nextTrackIdx;
        crossfading = false;
        updateUI();
      }
    }, FADE_TICK_MS);
  }

  // ── Playback ───────────────────────────────────────────────────
  function play() {
    audios[active].volume = volume;
    audios[active].play().catch(() => {});
    playing = true;
    updateUI();
  }

  function pause() {
    audios[active].pause();
    playing = false;
    updateUI();
  }

  function toggle() { playing ? pause() : play(); }

  // ── Near-end detection (used when PLAYLIST.length > 1) ────────
  function onTimeUpdate() {
    if (PLAYLIST.length < 2 || crossfading || !playing) return;
    const a = audios[active];
    if (!a.duration) return;
    if ((a.duration - a.currentTime) <= CROSSFADE_S + 0.2) {
      crossfadeTo((currentIdx + 1) % PLAYLIST.length);
    }
  }

  // Fallback: if timeupdate missed the window, handle ended event
  function onEnded() {
    if (!playing) return;
    if (PLAYLIST.length > 1) {
      crossfadeTo((currentIdx + 1) % PLAYLIST.length);
    }
    // Single-track: loop attribute handles restart automatically
  }

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    buildPlayer();
    loadTrack(0, 0);

    // Pre-load second slot with track 1 when playlist has multiple tracks
    if (PLAYLIST.length > 1) loadTrack(1, 1);

    audios.forEach(a => {
      a.addEventListener('timeupdate', onTimeUpdate);
      a.addEventListener('ended', onEnded);
    });

    const btn  = document.getElementById('ambient-btn');
    const wrap = document.getElementById('ambient-player');

    btn.addEventListener('click', toggle);

    // Scroll wheel adjusts volume while hovering the player
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      volume = Math.max(0, Math.min(1, volume + dir * SCROLL_STEP));
      if (playing) audios[active].volume = volume;
    }, { passive: false });
  });

}());

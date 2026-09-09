// The clock that drives the home page: one loop of T (equation time) played over
// loopSeconds of wall time. Owns the readout, the pause button, the scrubber, the
// cursor, and the active state of the lane pulses. Has no CDN dependency, so the
// sequence keeps running when the 3D figure cannot load.
import { PARAMS } from './psi.js';

const T = PARAMS.T;
const LOOP_MS = PARAMS.loopSeconds * 1000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clockEl  = document.getElementById('clock');
const readout  = document.getElementById('readout');
const pauseBtn = document.getElementById('pause');
const scrub    = document.getElementById('scrub');
const cursor   = document.getElementById('cursor');
const pulses   = Array.from(document.querySelectorAll('.pulse')).map((el) => ({
  el, t0: parseFloat(el.dataset.t0), t1: parseFloat(el.dataset.t1),
}));

const subs = new Set();
const state = {
  u: reduceMotion ? PARAMS.tFallback / T : 0,   // fraction of the loop, [0, 1)
  playing: !reduceMotion,
  scrubbing: false,
  last: 0,
};

export const clock = {
  get t() { return state.u * T; },
  get u() { return state.u; },
  get playing() { return state.playing; },
  subscribe(fn) { subs.add(fn); fn(state.u * T, state.u); return () => subs.delete(fn); },
};

function setPlaying(on) {
  state.playing = on;
  pauseBtn.textContent = on ? 'Pause' : 'Play';
  pauseBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
  state.last = 0;
}

function render() {
  const t = state.u * T;
  readout.textContent = `t = ${t.toFixed(2)}`;
  cursor.style.setProperty('--u', state.u.toFixed(4));
  if (!state.scrubbing) scrub.value = String(Math.round(state.u * 1000));
  for (const p of pulses) p.el.classList.toggle('is-active', state.u >= p.t0 && state.u < p.t1);
  for (const fn of subs) fn(t, state.u);
}

function frame(now) {
  if (state.playing) {
    if (state.last) {
      state.u += (now - state.last) / LOOP_MS;
      if (state.u >= 1) state.u -= Math.floor(state.u);
    }
    state.last = now;
    render();
  }
  requestAnimationFrame(frame);
}

// controls
pauseBtn.addEventListener('click', () => setPlaying(!state.playing));
scrub.addEventListener('pointerdown', () => { state.scrubbing = true; });
scrub.addEventListener('pointerup', () => { state.scrubbing = false; });
scrub.addEventListener('input', () => {
  if (state.playing) setPlaying(false);
  state.u = Number(scrub.value) / 1000;
  render();
});
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target === document.body) { e.preventDefault(); setPlaying(!state.playing); }
});

// reveal the controls only once script is running
clockEl.hidden = false;
scrub.hidden = false;
cursor.hidden = false;
setPlaying(state.playing);
render();
requestAnimationFrame(frame);

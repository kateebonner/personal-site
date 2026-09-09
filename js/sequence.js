// The clock that drives the figure: one loop of T (equation time) played over
// loopSeconds of wall time. Owns the readout and the pause button. Has no CDN
// dependency, so the readout keeps working when the 3D figure cannot load.
import { PARAMS } from './psi.js';

const T = PARAMS.T;
const LOOP_MS = PARAMS.loopSeconds * 1000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clockEl  = document.getElementById('clock');
const readout  = document.getElementById('readout');
const pauseBtn = document.getElementById('pause');

const subs = new Set();
const state = {
  u: reduceMotion ? PARAMS.tFallback / T : 0,   // fraction of the loop, [0, 1)
  playing: !reduceMotion,
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

pauseBtn.addEventListener('click', () => setPlaying(!state.playing));
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target === document.body) { e.preventDefault(); setPlaying(!state.playing); }
});

clockEl.hidden = false;
setPlaying(state.playing);
render();
requestAnimationFrame(frame);

// The clock that drives the figure: t runs from 0 to T and back over loopSeconds of
// wall time, like a hand-drawn flipbook played forward then backward. With reduced
// motion preferred it holds a fixed frame.
import { PARAMS } from './psi.js';

const T = PARAMS.T;
const LOOP_MS = PARAMS.loopSeconds * 1000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const subs = new Set();
const tri = (u) => 1 - Math.abs(2 * u - 1);          // 0 -> 1 -> 0 across the loop
let u = reduceMotion ? PARAMS.tFallback / (2 * T) : 0;   // fraction of the loop, [0, 1)
let last = 0;

export const clock = {
  get t() { return tri(u) * T; },
  get u() { return u; },
  subscribe(fn) { subs.add(fn); fn(tri(u) * T, u); return () => subs.delete(fn); },
};

function frame(now) {
  if (last) {
    u += (now - last) / LOOP_MS;
    if (u >= 1) u -= Math.floor(u);
  }
  last = now;
  for (const fn of subs) fn(tri(u) * T, u);
  requestAnimationFrame(frame);
}
if (!reduceMotion) requestAnimationFrame(frame);

// The clock that drives the figure: t runs from 0 to T over loopSeconds of wall time,
// forward only, then starts again; the figure fades its ink across the cut. With reduced
// motion preferred it holds a fixed frame.
import { PARAMS } from './psi.js';

const T = PARAMS.T;
const LOOP_MS = PARAMS.loopSeconds * 1000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const subs = new Set();
let u = reduceMotion ? PARAMS.tFallback / T : 0;   // fraction of the loop, [0, 1)
let last = 0;

export const clock = {
  get t() { return u * T; },
  get u() { return u; },
  subscribe(fn) { subs.add(fn); fn(u * T, u); return () => subs.delete(fn); },
};

function frame(now) {
  if (last) {
    u += (now - last) / LOOP_MS;
    if (u >= 1) u -= Math.floor(u);
  }
  last = now;
  for (const fn of subs) fn(u * T, u);
  requestAnimationFrame(frame);
}
if (!reduceMotion) requestAnimationFrame(frame);

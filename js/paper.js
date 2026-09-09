// The paper and the drawing as one photographed sheet: on every drawn frame, in step with the
// figure, the sheet takes a small seeded change of rotation and position, the way frames of a
// stop-motion film sit slightly differently under the camera. Both the paper layer and the
// figure's canvas turn about the same pivot, the viewport centre, so they move as one object.
// Tint stays constant. Holds still under reduced motion.
import { PARAMS } from './psi.js';

const root = document.documentElement;
const mount = document.getElementById('wp-mount');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const centred = (rnd) => rnd() + rnd() - 1;   // -1..1, peaked at 0

// the figure's pivot: the viewport centre, in the canvas box's own coordinates
function pivot() {
  if (!mount) return;
  const r = mount.getBoundingClientRect();
  root.style.setProperty('--sheet-ox', `${(window.innerWidth / 2 - r.left).toFixed(1)}px`);
  root.style.setProperty('--sheet-oy', `${(window.innerHeight / 2 - r.top).toFixed(1)}px`);
}

let last = -1;
function frame() {
  const idx = Math.floor(performance.now() * PARAMS.fps / 1000);
  if (idx !== last) {
    last = idx;
    const rnd = mulberry32(4242 + idx);
    root.style.setProperty('--sheet-rot', `${(centred(rnd) * 0.35).toFixed(3)}deg`);
    root.style.setProperty('--sheet-dx', `${(centred(rnd) * 4).toFixed(1)}px`);
    root.style.setProperty('--sheet-dy', `${(centred(rnd) * 4).toFixed(1)}px`);
  }
  requestAnimationFrame(frame);
}
if (!reduceMotion) {
  pivot();
  window.addEventListener('resize', pivot);
  if (mount) new ResizeObserver(pivot).observe(mount);
  requestAnimationFrame(frame);
}

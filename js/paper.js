// The paper as a stack of photographs: on every drawn frame, in step with the figure, the
// background layer takes a small seeded change of rotation and position, the way frames of a
// stop-motion film sit slightly differently under the camera. Tint stays constant. Holds still
// under reduced motion.
import { PARAMS } from './psi.js';

const layer = document.getElementById('paper');
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

let last = -1;
function frame() {
  const idx = Math.floor(performance.now() * PARAMS.fps / 1000);
  if (idx !== last) {
    last = idx;
    const rnd = mulberry32(4242 + idx);
    const rot = centred(rnd) * 0.35;            // degrees
    const dx = centred(rnd) * 4, dy = centred(rnd) * 4;   // px
    layer.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${rot.toFixed(3)}deg)`;
  }
  requestAnimationFrame(frame);
}
if (layer && !reduceMotion) requestAnimationFrame(frame);

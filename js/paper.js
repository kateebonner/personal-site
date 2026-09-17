// The paper and the drawings as one photographed sheet: on every drawn frame, in step with the
// figures, the sheet takes a small seeded change of rotation and position, the way frames of a
// stop-motion film sit slightly differently under the camera. Tint stays constant. Holds still
// under reduced motion.
//
// The transform is written straight onto the handful of elements that move (the paper layer, the
// home figure's mount, anything marked data-sheet). It used to be published as custom properties on
// the page root, which made the browser restyle the whole document ten times a second; on the
// note, with its thousands of math nodes, that was most of the main thread's work on a phone.
import { PARAMS } from './psi.js';

const mount = document.getElementById('wp-mount');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const movers = () => [document.getElementById('paper'), mount, ...document.querySelectorAll('[data-sheet]')].filter(Boolean);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const centred = (rnd) => rnd() + rnd() - 1;   // -1..1, peaked at 0

// the home figure turns about the viewport centre, expressed in its own box's coordinates
function pivot() {
  if (!mount) return;
  const r = mount.getBoundingClientRect();
  mount.style.transformOrigin = `${(window.innerWidth / 2 - r.left).toFixed(1)}px ${(window.innerHeight / 2 - r.top).toFixed(1)}px`;
}

let last = -1, els = null;
function frame() {
  const idx = Math.floor(performance.now() * PARAMS.fps / 1000);
  if (idx !== last) {
    last = idx;
    const rnd = mulberry32(4242 + idx);
    const rot = (centred(rnd) * 0.15).toFixed(3), dx = (centred(rnd) * 1.5).toFixed(1), dy = (centred(rnd) * 1.5).toFixed(1);   // gentle: no one's eyes should work
    const t = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    if (!els || idx % 20 === 0) els = movers();   // the set is small and nearly static; refresh it every two seconds
    for (const el of els) el.style.transform = t;
  }
  requestAnimationFrame(frame);
}
if (!reduceMotion) {
  pivot();
  window.addEventListener('resize', pivot);
  if (mount) new ResizeObserver(pivot).observe(mount);
  requestAnimationFrame(frame);
}

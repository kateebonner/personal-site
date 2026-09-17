// Hover on a Notes entry: the row is scribbled in with the pencil, behind the type. One long back-and-forth
// stroke shades the row from left to right in under half a second, keeps boiling at ten frames a second while
// the pointer or keyboard focus stays, and is rubbed out the way it came when it leaves. Drawn by the same
// brush as the figures, in the one ink. With reduced motion the shading simply appears and disappears.
import { sketch, mulberry32 } from './brush.js';

const INK = [122, 30, 44];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

// a hand shading a box: leaning strokes up and down across the height, creeping right, the turns rounded,
// the spacing uneven, and not every stroke reaching the edge
function shading(w, h, seed, period, inset, lean) {
  const rnd = mulberry32(seed), P = [], n = Math.ceil((w - 2 * inset - lean) / (period / 2));
  for (let i = 0; i <= n; i++) {
    const up = i % 2 === 1, short = (1 - (0.7 + rnd() * 0.3)) * h * 0.4;
    const x = inset + i * (period / 2) + (rnd() - 0.5) * period * 0.55 + (up ? lean : 0);
    P.push([x, up ? inset + short : h - inset - short]);
  }
  const pts = [], cr = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
  for (let i = 0; i < P.length - 1; i++) {   // a Catmull-Rom spline through the turning points rounds every turn
    const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
    for (let k = 0; k < 8; k++) { const t = k / 8; pts.push([Math.min(w - 1, Math.max(1, cr(p0[0], p1[0], p2[0], p3[0], t))), Math.min(h - 1, Math.max(1, cr(p0[1], p1[1], p2[1], p3[1], t)))]); }
  }
  return pts;
}

function attach(entry) {
  let host = null, stop = null, start = 0, leaving = 0, on = false;
  const IN = 0.42, OUT = 0.22;
  const amount = () => {   // how much of the scribble is on the page, 0..1
    const now = performance.now() / 1000;
    if (reduceMotion) return on ? 1 : 0;
    if (on) return ease((now - start) / IN);
    return leaving ? Math.max(0, leaving.from * (1 - (now - leaving.at) / OUT)) : 0;
  };
  const mount = () => {
    if (host) return;
    host = document.createElement('span'); host.className = 'entry__scribble'; host.setAttribute('aria-hidden', 'true');
    entry.prepend(host);
    let cache = null;
    stop = sketch(host, {
      ink: INK, fps: 10, takes: 4,
      frame() {
        const w = host.clientWidth, h = host.clientHeight, u = amount();
        if (!on && u <= 0) { queueMicrotask(unmount); return []; }
        if (!cache || cache.w !== w || cache.h !== h) cache = { w, h, a: shading(w, h, 31, 13, 6, h * 0.34), b: shading(w, h, 77, 21, 9, h * 0.22) };
        const cut = (pts) => pts.slice(0, Math.max(2, Math.round(pts.length * u)));
        return [{ pts: cut(cache.a), weight: 'light', alpha: 0.42, width: 1.25 }, { pts: cut(cache.b), weight: 'light', alpha: 0.26, width: 1.6 }];
      },
    });
  };
  const unmount = () => { if (!host || on) return; stop?.(); host.remove(); host = null; stop = null; leaving = 0; };
  const enter = () => { if (on) return; on = true; start = performance.now() / 1000 - (leaving ? amount() * IN : 0); leaving = 0; mount(); stop?.redraw?.(); };
  const leave = () => { if (!on) return; const from = amount(); on = false; leaving = { from, at: performance.now() / 1000 }; if (reduceMotion) unmount(); };
  entry.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') enter(); });
  entry.addEventListener('pointerleave', leave);
  entry.addEventListener('focus', enter);
  entry.addEventListener('blur', leave);
}

document.querySelectorAll('.notes .entry').forEach(attach);

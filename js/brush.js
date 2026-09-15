// pencil-stop-motion/brush.js — a Canvas 2D graphite brush that draws curves as hand-drawn
// stop motion: low frame rate, cycled hand-traced takes, layered translucent passes,
// paper-tooth grain, Catmull-Rom curves, pressure-scaled width. No dependencies.
//
//   import { sketch } from './brush.js';
//   const stop = sketch(hostElement, { ink: [r, g, b], fps, takes, frame(t) => strokes, clock });
//
// frame(t) returns an array of strokes: { pts: [[x, y], ...] in CSS px, damp?: Float32Array 0..1,
// weight: 'graphite' | 'light', alpha?, width?, scale? (multiplies every pass width) }, or
// { strokes, ink } where ink in 0..1 scales every
// alpha (use it to fade across a loop cut). A stroke may instead be a typed label,
// { text, at: [x, y], size?, align?, baseline?, alpha? }, set in the ink with the take's wobble in
// the `font` option's face. Returns a function that stops the loop; call its .redraw() to force a frame.

const DEFAULTS = {
  ink: [122, 30, 44],
  fps: 10,
  takes: 4,
  shake: (w) => Math.max(1, 0.003 * w),
  chunk: 25,
  passes: [
    { a: 0.16, w: 3.0,  wob: 1.4 },   // soft halo
    { a: 0.42, w: 0.85, wob: 2.6 },   // outer side stroke
    { a: 0.55, w: 0.95, wob: 1.9 },   // side stroke
    { a: 0.95, w: 1.25, wob: 1.0 },   // core
  ],
  light: { a: 0.28, w: 0.75, wob: 0.8 },
  font: 'system-ui, sans-serif',
  clock: () => performance.now() / 1000,
};

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A smooth hand shake along n points: three sinusoids per axis, unit amplitude.
// Frequencies are per unit of curve (scaled by 600 / n) so denser sampling keeps the same wobble.
export function makeTake(seed, n) {
  const rnd = mulberry32(seed);
  const terms = 3, x = new Float32Array(n), y = new Float32Array(n);
  const k = [], ph = [], a = [], sc = 600 / n;
  for (let j = 0; j < terms * 2; j++) { k.push((0.015 + rnd() * 0.09) * sc); ph.push(rnd() * Math.PI * 2); a.push(0.4 + rnd() * 0.8); }
  for (let i = 0; i < n; i++) {
    let sx = 0, sy = 0;
    for (let j = 0; j < terms; j++) { sx += a[j] * Math.sin(k[j] * i + ph[j]); sy += a[j + terms] * Math.sin(k[j + terms] * i + ph[j + terms]); }
    x[i] = sx / terms; y[i] = sy / terms;
  }
  return { x, y };
}

// Paper tooth: the ink at random density per device pixel, used as the stroke pattern.
export function makeGrain(ink, seed = 7, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size), rnd = mulberry32(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rnd();
    img.data[i] = ink[0]; img.data[i + 1] = ink[1]; img.data[i + 2] = ink[2];
    img.data[i + 3] = Math.round(255 * (0.2 + 0.8 * v * v));
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function sketch(host, options) {
  const o = { ...DEFAULTS, ...options };
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';   // the canvas must never escape its host
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const grain = ctx.createPattern(makeGrain(o.ink), 'repeat');
  const takeCache = new Map();
  const takeFor = (key, n) => { const k = `${key}:${n}`; if (!takeCache.has(k)) takeCache.set(k, makeTake(11 + key * 7, n)); return takeCache.get(k); };

  let dpr = 1, W = 0, H = 0, shake = 1;
  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w; H = h;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    shake = o.shake(w);
    draw(true);
  }

  function curve(X, Y, from, to) {
    ctx.beginPath();
    ctx.moveTo(X[from], Y[from]);
    for (let i = from; i < to; i++) {
      const i0 = Math.max(i - 1, 0), i3 = Math.min(i + 2, X.length - 1);
      ctx.bezierCurveTo(X[i] + (X[i + 1] - X[i0]) / 6, Y[i] + (Y[i + 1] - Y[i0]) / 6, X[i + 1] - (X[i3] - X[i]) / 6, Y[i + 1] - (Y[i3] - Y[i]) / 6, X[i + 1], Y[i + 1]);
    }
    ctx.stroke();
  }

  function pass(pts, damp, wob, wobScale, alpha, width, pressure) {
    const n = pts.length; if (n < 2) return;
    const X = new Float32Array(n), Y = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const d = damp ? damp[i] : 1;
      X[i] = (pts[i][0] + wob.x[i % wob.x.length] * shake * wobScale * d) * dpr;
      Y[i] = (pts[i][1] + wob.y[i % wob.y.length] * shake * wobScale * d) * dpr;
    }
    ctx.strokeStyle = grain;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = alpha * inkLevel;
    if (!pressure || !damp) { ctx.lineWidth = width * dpr; curve(X, Y, 0, n - 1); return; }
    for (let from = 0; from < n - 1; from += o.chunk) {
      const to = Math.min(from + o.chunk, n - 1);
      let d = 0; for (let i = from; i <= to; i++) d += damp[i]; d /= (to - from + 1);
      ctx.lineWidth = width * (0.7 + 0.6 * d) * dpr;
      curve(X, Y, from, to);
    }
  }

  let frameIdx = -1, strokeSeq = 0, inkLevel = 1;
  function draw(force) {
    if (!W || !H) return;   // a host with no size (stylesheet missing or stale) gets nothing drawn
    const idx = reduceMotion ? 0 : Math.floor(o.clock() * o.fps);
    if (!force && idx === frameIdx) return;
    frameIdx = idx;
    const take = idx % o.takes;
    const out = o.frame(o.clock());
    const strokes = Array.isArray(out) ? out : out.strokes;
    inkLevel = Array.isArray(out) ? 1 : (out.ink ?? 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeSeq = 0;
    for (const s of strokes) {
      if (s.text != null) {
        const wob = takeFor(3000 + take * 97 + (strokeSeq++), 8);
        ctx.font = `${s.fontWeight ?? 500} ${(s.size ?? 13) * dpr}px ${o.font}`;
        ctx.fillStyle = `rgb(${o.ink[0]},${o.ink[1]},${o.ink[2]})`;
        ctx.globalAlpha = (s.alpha ?? 0.9) * inkLevel;
        ctx.textAlign = s.align ?? 'center'; ctx.textBaseline = s.baseline ?? 'middle';
        ctx.fillText(s.text, (s.at[0] + wob.x[0] * shake * 0.5) * dpr, (s.at[1] + wob.y[0] * shake * 0.5) * dpr);
        continue;
      }
      const n = s.pts.length;
      if (s.weight === 'graphite') {
        o.passes.forEach((g, p) => pass(s.pts, s.damp, takeFor(take * o.passes.length + p, n), g.wob, s.alpha ?? g.a, (s.width ?? g.w) * (s.scale ?? 1), true));
      } else {
        const g = o.light;
        pass(s.pts, null, takeFor(1000 + take + (strokeSeq++), n), g.wob, s.alpha ?? g.a, s.width ?? g.w, false);
      }
    }
    ctx.globalAlpha = 1;
  }

  let raf = 0;
  const loop = () => { draw(false); raf = requestAnimationFrame(loop); };
  new ResizeObserver(fit).observe(host);
  fit();
  if (!reduceMotion) raf = requestAnimationFrame(loop);
  const stop = () => cancelAnimationFrame(raf);
  stop.redraw = () => draw(true);
  return stop;
}

// The live figure as a pencil sketch, animated like stop motion: psi(x, t) drawn with a
// graphite brush on a 2D canvas, ten frames a second, each frame a fresh hand-traced take.
// Every pass is one continuous curve; the grain comes from a paper-tooth pattern fixed to
// the canvas that the strokes pick up, the way pencil takes the texture of the sheet.
// Oblique projection: x runs across, Re psi up, Im psi toward the viewer. No third-party
// code; if scripts are off the static frame image stays in place.
import { PARAMS, psi, makeBuffers } from './psi.js';

const DRAW = Object.freeze({ ...PARAMS, samples: 1000 });
const N = DRAW.samples;
const FPS = 10;            // drawn frames per second
const TAKES = 4;           // hand-traced takes, cycled frame to frame
const CHUNK = 25;          // points per width-chunk along the curve
const RING_EVERY = 30, RING_SEG = 90, LONG_LINES = 8, LONG_STEP = 5, AXIS_PTS = 64;
const INK = [122, 30, 44]; // #7A1E2C
const PASSES = [
  { a: 0.16, w: 3.0,  wob: 1.4 },   // soft halo
  { a: 0.42, w: 0.85, wob: 2.6 },   // outer side stroke
  { a: 0.55, w: 0.95, wob: 1.9 },   // side stroke
  { a: 0.95, w: 1.25, wob: 1.0 },   // core
];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// smooth hand shake along a polyline, in unit scale
function makeTake(seed, n) {
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
// paper tooth: ink at random density per device pixel
function makeGrain() {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'), img = g.createImageData(s, s), rnd = mulberry32(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rnd();
    img.data[i] = INK[0]; img.data[i + 1] = INK[1]; img.data[i + 2] = INK[2];
    img.data[i + 3] = Math.round(255 * (0.2 + 0.8 * v * v));
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function mount(figure, host, clock) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const grain = ctx.createPattern(makeGrain(), 'repeat');

  const now = makeBuffers(DRAW);
  const zero = psi(0, DRAW);
  const cur = { re: new Float64Array(N), im: new Float64Array(N) };
  const takes = Array.from({ length: TAKES * PASSES.length }, (_, i) => makeTake(11 + i * 7, N));
  const axisTakes = Array.from({ length: TAKES }, (_, i) => makeTake(201 + i * 7, AXIS_PTS));
  const ringIdx = [];
  for (let i = 0; i < N; i += RING_EVERY) ringIdx.push(i);

  let dpr = 1;
  const view = { left: 0, ex: 1, cy: 0, eRe: [0, 0], eIm: [0, 0], shake: 1 };
  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    view.left = 0.06 * w; view.ex = (0.97 * w - 0.06 * w) / (PARAMS.xMax - PARAMS.xMin); view.cy = 0.5 * h;
    const v = Math.min(0.375 * h, 0.2 * w);
    view.eRe = [0, -v]; view.eIm = [0.058 * w, 0.26 * v];
    view.shake = Math.max(1.2, 0.0045 * w);
    drawFrame(true);
  }
  const proj = (x, r, i) => [view.left + (x - PARAMS.xMin) * view.ex + r * view.eRe[0] + i * view.eIm[0], view.cy + r * view.eRe[1] + i * view.eIm[1]];

  // one continuous Catmull-Rom curve through the points, in chunks so the width can follow pressure
  function curve(X, Y, from, to) {
    ctx.beginPath();
    ctx.moveTo(X[from], Y[from]);
    for (let i = from; i < to; i++) {
      const i0 = Math.max(i - 1, 0), i3 = Math.min(i + 2, X.length - 1);
      ctx.bezierCurveTo(X[i] + (X[i + 1] - X[i0]) / 6, Y[i] + (Y[i + 1] - Y[i0]) / 6, X[i + 1] - (X[i3] - X[i]) / 6, Y[i + 1] - (Y[i3] - Y[i]) / 6, X[i + 1], Y[i + 1]);
    }
    ctx.stroke();
  }
  function stroke(pts, damp, wob, wobScale, alpha, width, pressure) {
    const n = pts.length, X = new Float32Array(n), Y = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const d = damp ? damp[i] : 1;
      X[i] = (pts[i][0] + wob.x[i % wob.x.length] * view.shake * wobScale * d) * dpr;
      Y[i] = (pts[i][1] + wob.y[i % wob.y.length] * view.shake * wobScale * d) * dpr;
    }
    ctx.strokeStyle = grain;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = alpha;
    if (!pressure) { ctx.lineWidth = width * dpr; curve(X, Y, 0, n - 1); return; }
    for (let from = 0; from < n - 1; from += CHUNK) {
      const to = Math.min(from + CHUNK, n - 1);
      let d = 0; for (let i = from; i <= to; i++) d += damp[i]; d /= (to - from + 1);
      ctx.lineWidth = width * (0.7 + 0.6 * d) * dpr;
      curve(X, Y, from, to);
    }
  }

  let frameIdx = -1, lastT = 0, lastU = 0;
  function drawFrame(force) {
    const idx = reduceMotion ? 0 : Math.floor(performance.now() / (1000 / FPS));
    if (!force && idx === frameIdx) return;
    frameIdx = idx;
    const take = idx % TAKES;
    const t = lastT, u = lastU;

    psi(t, DRAW, now);
    let s = 0;
    if (u >= PARAMS.blendStart) { const k = (u - PARAMS.blendStart) / (1 - PARAMS.blendStart); s = k * k * (3 - 2 * k); }
    let peak = 1e-9;
    for (let i = 0; i < N; i++) {
      cur.re[i] = now.re[i] + (zero.re[i] - now.re[i]) * s;
      cur.im[i] = now.im[i] + (zero.im[i] - now.im[i]) * s;
      peak = Math.max(peak, Math.hypot(cur.re[i], cur.im[i]));
    }
    const damp = new Float32Array(N);
    for (let i = 0; i < N; i++) damp[i] = 0.2 + 0.8 * Math.hypot(cur.re[i], cur.im[i]) / peak;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // envelope: lightly sketched construction lines
    for (const i of ringIdx) {
      const r = Math.hypot(cur.re[i], cur.im[i]);
      if (r < 0.03) continue;
      const pts = [];
      for (let k = 0; k <= RING_SEG; k++) { const a = (k / RING_SEG) * Math.PI * 2; pts.push(proj(now.xs[i], r * Math.cos(a), r * Math.sin(a))); }
      stroke(pts, null, takes[(take + i) % takes.length], 0.8, 0.28, 0.75, false);
    }
    for (let j = 0; j < LONG_LINES; j++) {
      const a = (j / LONG_LINES) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const pts = [];
      for (let i = 0; i < N; i += LONG_STEP) { const r = Math.hypot(cur.re[i], cur.im[i]); pts.push(proj(now.xs[i], r * ca, r * sa)); }
      stroke(pts, null, takes[(take + j + 3) % takes.length], 0.8, 0.2, 0.7, false);
    }
    // axis: two light passes
    const axisPts = [];
    for (let i = 0; i < AXIS_PTS; i++) axisPts.push(proj(PARAMS.xMin + (PARAMS.xMax + 0.4 - PARAMS.xMin) * (i / (AXIS_PTS - 1)), 0, 0));
    stroke(axisPts, null, axisTakes[take], 0.5, 0.5, 0.9, false);
    stroke(axisPts, null, axisTakes[(take + 1) % TAKES], 0.5, 0.25, 0.8, false);
    // the wavefunction: graphite passes, halo first, core last
    const pts = [];
    for (let i = 0; i < N; i++) pts.push(proj(now.xs[i], cur.re[i], cur.im[i]));
    PASSES.forEach((g, p) => stroke(pts, damp, takes[take * PASSES.length + p], g.wob, g.a, g.w, true));
    ctx.globalAlpha = 1;
  }

  clock.subscribe((t, u) => { lastT = t; lastU = u; drawFrame(false); });
  new ResizeObserver(fit).observe(host);
  figure.classList.add('is-live');
  fit();
  return true;
}

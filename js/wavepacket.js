// The live figure as a pencil sketch, animated like stop motion: psi(x, t) drawn with a
// graphite brush on a 2D canvas, ten frames a second, each frame a fresh hand-traced take.
// Oblique projection: x runs across, Re psi up, Im psi toward the viewer. No WebGL and no
// third-party code; if scripts are off the inline SVG frame stays in place.
import { PARAMS, psi, makeBuffers } from './psi.js';

const N = PARAMS.samples;
const FPS = 10;            // drawn frames per second
const TAKES = 4;           // hand-traced takes, cycled frame to frame
const RING_EVERY = 12, RING_SEG = 36, LONG_LINES = 8, LONG_STEP = 3, AXIS_PTS = 64;
const GRAPHITE = [
  { c: '106,20,36', a: 0.62, w: 1.15, wob: 1.0 },   // core
  { c: '122,30,44', a: 0.30, w: 0.85, wob: 1.9 },   // side stroke
  { c: '138,48,64', a: 0.22, w: 0.8,  wob: 2.6 },   // second side stroke
  { c: '122,30,44', a: 0.07, w: 2.8,  wob: 1.4 },   // soft halo
];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// smooth hand shake along a polyline, in unit scale (multiplied by pixels later)
function makeTake(seed, n) {
  const rnd = mulberry32(seed);
  const terms = 3, x = new Float32Array(n), y = new Float32Array(n);
  const k = [], ph = [], a = [];
  for (let j = 0; j < terms * 2; j++) { k.push(0.015 + rnd() * 0.09); ph.push(rnd() * Math.PI * 2); a.push(0.4 + rnd() * 0.8); }
  for (let i = 0; i < n; i++) {
    let sx = 0, sy = 0;
    for (let j = 0; j < terms; j++) { sx += a[j] * Math.sin(k[j] * i + ph[j]); sy += a[j + terms] * Math.sin(k[j + terms] * i + ph[j + terms]); }
    x[i] = sx / terms; y[i] = sy / terms;
  }
  return { x, y };
}

export function mount(figure, host, clock) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const now = makeBuffers();
  const zero = psi(0);
  const cur = { re: new Float64Array(N), im: new Float64Array(N) };
  const takes = Array.from({ length: TAKES * GRAPHITE.length }, (_, i) => makeTake(11 + i * 7, N));
  const axisTakes = Array.from({ length: TAKES }, (_, i) => makeTake(201 + i * 7, AXIS_PTS));
  const ringIdx = [];
  for (let i = 0; i < N; i += RING_EVERY) ringIdx.push(i);

  let W = 0, H = 0, dpr = 1;
  const view = { left: 0, ex: 1, cy: 0, eRe: [0, 0], eIm: [0, 0], shake: 1 };
  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w; H = h;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    view.left = 0.06 * w; view.ex = (0.97 * w - 0.06 * w) / (PARAMS.xMax - PARAMS.xMin); view.cy = 0.5 * h;
    const v = Math.min(0.375 * h, 0.2 * w);        // keep the helix's proportions whatever the lane height
    view.eRe = [0, -v]; view.eIm = [0.058 * w, 0.26 * v];
    view.shake = Math.max(1.2, 0.0045 * w);       // pixels of hand shake at unit amplitude
    drawFrame(true);
  }
  const proj = (x, r, i) => [view.left + (x - PARAMS.xMin) * view.ex + r * view.eRe[0] + i * view.eIm[0], view.cy + r * view.eRe[1] + i * view.eIm[1]];

  // a graphite stroke: many short segments, each with its own grain of alpha and width
  function pencil(pts, damp, pass, take, rnd) {
    const g = GRAPHITE[pass];
    const wob = takes[(take * GRAPHITE.length + pass) % takes.length];
    ctx.strokeStyle = `rgb(${g.c})`;
    ctx.lineCap = 'round';
    let px = 0, py = 0;
    for (let i = 0; i < pts.length; i++) {
      const d = damp ? damp[i] : 1;
      const x = (pts[i][0] + wob.x[i] * view.shake * g.wob * d) * dpr;
      const y = (pts[i][1] + wob.y[i] * view.shake * g.wob * d) * dpr;
      if (i) {
        ctx.globalAlpha = g.a * (0.55 + 0.45 * rnd()) * (0.7 + 0.3 * d);
        ctx.lineWidth = g.w * (0.75 + 0.5 * d) * (0.85 + 0.3 * rnd()) * dpr;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      }
      px = x; py = y;
    }
  }
  function lightLine(pts, alpha, width, wob, rnd) {
    ctx.strokeStyle = 'rgb(122,30,44)';
    ctx.lineWidth = width * dpr;
    let px = 0, py = 0;
    for (let i = 0; i < pts.length; i++) {
      const x = (pts[i][0] + (wob ? wob.x[i % wob.x.length] * view.shake : 0)) * dpr;
      const y = (pts[i][1] + (wob ? wob.y[i % wob.y.length] * view.shake : 0)) * dpr;
      if (i) {
        ctx.globalAlpha = alpha * (0.5 + 0.5 * rnd());
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      }
      px = x; py = y;
    }
  }

  let frameIdx = -1, lastT = 0, lastU = 0;
  function drawFrame(force) {
    const idx = reduceMotion ? 0 : Math.floor(performance.now() / (1000 / FPS));
    if (!force && idx === frameIdx) return;
    frameIdx = idx;
    const take = idx % TAKES;
    const rnd = mulberry32(1000 + idx);
    const t = lastT, u = lastU;

    psi(t, PARAMS, now);
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
      lightLine(pts, 0.16, 0.7, takes[(take + i) % takes.length], rnd);
    }
    for (let j = 0; j < LONG_LINES; j++) {
      const a = (j / LONG_LINES) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const pts = [];
      for (let i = 0; i < N; i += LONG_STEP) { const r = Math.hypot(cur.re[i], cur.im[i]); pts.push(proj(now.xs[i], r * ca, r * sa)); }
      lightLine(pts, 0.11, 0.65, takes[(take + j + 3) % takes.length], rnd);
    }
    // axis: two light passes
    const axisPts = [];
    for (let i = 0; i < AXIS_PTS; i++) axisPts.push(proj(PARAMS.xMin + (PARAMS.xMax + 0.4 - PARAMS.xMin) * (i / (AXIS_PTS - 1)), 0, 0));
    lightLine(axisPts, 0.3, 0.8, axisTakes[take], rnd);
    lightLine(axisPts, 0.14, 0.7, axisTakes[(take + 1) % TAKES], rnd);
    // the wavefunction: graphite passes, halo first, core last
    const pts = [];
    for (let i = 0; i < N; i++) pts.push(proj(now.xs[i], cur.re[i], cur.im[i]));
    for (const pass of [3, 2, 1, 0]) pencil(pts, damp, pass, take, rnd);
    ctx.globalAlpha = 1;
  }

  clock.subscribe((t, u) => { lastT = t; lastU = u; drawFrame(false); });
  new ResizeObserver(fit).observe(host);
  figure.classList.add('is-live');
  fit();
  return true;
}

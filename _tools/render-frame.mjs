// Renders the static figure of psi(x, t) at PARAMS.tFallback as an SVG pencil sketch:
// graphite passes (halo, two side strokes, core) roughened by a displacement filter and
// grained by a noise mask, plus lightly sketched envelope lines and one axis.
// Output: assets/wavepacket-frame.svg (inlined into index.html). Run: node _tools/render-frame.mjs
import { writeFileSync } from 'node:fs';
import { PARAMS, psi } from '../js/psi.js';

const t = PARAMS.tFallback;
const { xs, re, im } = psi(t);
const N = xs.length;
const W = 1200, H = 560;
const left = 72, right = 1164, cy = 280;
const ex = (right - left) / (PARAMS.xMax - PARAMS.xMin);
const eRe = [0, -210], eIm = [70, 55];
const proj = (x, r, i) => [left + (x - PARAMS.xMin) * ex + r * eRe[0] + i * eIm[0], cy + r * eRe[1] + i * eIm[1]];
const f = (v) => v.toFixed(1);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let q = Math.imul(a ^ (a >>> 15), 1 | a);
    q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
    return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
  };
}
function makeTake(seed, n) {
  const rnd = mulberry32(seed);
  const terms = 3, dx = new Float64Array(n), dy = new Float64Array(n);
  const k = [], ph = [], a = [];
  for (let j = 0; j < terms * 2; j++) { k.push(0.015 + rnd() * 0.09); ph.push(rnd() * Math.PI * 2); a.push(0.4 + rnd() * 0.8); }
  for (let i = 0; i < n; i++) {
    let sx = 0, sy = 0;
    for (let j = 0; j < terms; j++) { sx += a[j] * Math.sin(k[j] * i + ph[j]); sy += a[j + terms] * Math.sin(k[j + terms] * i + ph[j + terms]); }
    dx[i] = sx / terms; dy[i] = sy / terms;
  }
  return { dx, dy };
}
const SHAKE = 5.4;   // px at unit amplitude, matching the live figure at 1200 wide
let peak = 1e-9;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.hypot(re[i], im[i]));
const damp = (i) => 0.2 + 0.8 * Math.hypot(re[i], im[i]) / peak;
const poly = (pts, tk, wob, dampFn) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x + tk.dx[i % N] * SHAKE * wob * (dampFn ? dampFn(i) : 1))} ${f(y + tk.dy[i % N] * SHAKE * wob * (dampFn ? dampFn(i) : 1))}`).join('');

let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wp-title wp-desc" class="wp-frame">`;
out += `<title id="wp-title">Free Gaussian wavepacket at t = ${t.toFixed(2)}</title>`;
out += `<desc id="wp-desc">A pencil sketch of a helix along x with the real and imaginary parts of psi as the two transverse axes, inside a lightly sketched envelope of radius |psi|. The packet is centred near x = ${(PARAMS.k0 * t).toFixed(1)}.</desc>`;
out += `<defs><filter id="wp-pencil" x="-3%" y="-8%" width="106%" height="116%" color-interpolation-filters="sRGB">`
     + `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="warp"/>`
     + `<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="rough"/>`
     + `<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="grain"/>`
     + `<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.9 -0.35" result="mask"/>`
     + `<feComposite in="rough" in2="mask" operator="in"/>`
     + `</filter></defs>`;
out += `<g filter="url(#wp-pencil)" fill="none" stroke-linecap="round" stroke-linejoin="round">`;

// envelope: lightly sketched
let rings = '';
for (let i = 0; i < N; i += 12) {
  const r = Math.hypot(re[i], im[i]); if (r < 0.03) continue;
  const pts = []; for (let k = 0; k <= 36; k++) { const a = (k / 36) * Math.PI * 2; pts.push(proj(xs[i], r * Math.cos(a), r * Math.sin(a))); }
  rings += poly(pts, makeTake(300 + i, 40), 0.8) + 'Z';
}
out += `<path d="${rings}" stroke="var(--line, #7A1E2C)" stroke-opacity="0.22" stroke-width="0.9"/>`;
let longs = '';
for (let j = 0; j < 8; j++) {
  const a = (j / 8) * Math.PI * 2;
  const pts = []; for (let i = 0; i < N; i += 3) { const r = Math.hypot(re[i], im[i]); pts.push(proj(xs[i], r * Math.cos(a), r * Math.sin(a))); }
  longs += poly(pts, makeTake(400 + j, N), 0.8);
}
out += `<path d="${longs}" stroke="var(--line, #7A1E2C)" stroke-opacity="0.16" stroke-width="0.85"/>`;
// axis
const axisPts = []; for (let i = 0; i < 64; i++) axisPts.push(proj(PARAMS.xMin + (PARAMS.xMax + 0.4 - PARAMS.xMin) * (i / 63), 0, 0));
out += `<path d="${poly(axisPts, makeTake(201, 64), 0.5)}" stroke="var(--line, #7A1E2C)" stroke-opacity="0.4" stroke-width="1"/>`;
out += `<path d="${poly(axisPts, makeTake(208, 64), 0.5)}" stroke="var(--line, #7A1E2C)" stroke-opacity="0.18" stroke-width="0.9"/>`;
// the wavefunction: halo, side strokes, core
const pts = []; for (let i = 0; i < N; i++) pts.push(proj(xs[i], re[i], im[i]));
const passes = [
  { seed: 41, wob: 1.4, color: 'rgb(122,30,44)', op: 0.09, w: 3.4 },
  { seed: 25, wob: 2.6, color: 'rgb(138,48,64)', op: 0.3,  w: 1.05 },
  { seed: 18, wob: 1.9, color: 'rgb(122,30,44)', op: 0.38, w: 1.1 },
  { seed: 11, wob: 1.0, color: 'rgb(106,20,36)', op: 0.8,  w: 1.35 },
];
for (const p of passes) out += `<path d="${poly(pts, makeTake(p.seed, N), p.wob, damp)}" stroke="${p.color}" stroke-opacity="${p.op}" stroke-width="${p.w}"/>`;
out += `</g></svg>`;
writeFileSync(new URL('../assets/wavepacket-frame.svg', import.meta.url), out + '\n');
console.log(`wrote assets/wavepacket-frame.svg  (t=${t}, bytes=${out.length})`);

// Renders the static figure of psi(x, t) at PARAMS.tFallback as SVG in the hand-drawn
// language of the live figure: 1px ink curve with a faint second stroke, a wireframe
// envelope, and one axis, all with a small deterministic hand shake.
// Output: assets/wavepacket-frame.svg (inlined into index.html). Run: node _tools/render-frame.mjs
import { writeFileSync } from 'node:fs';
import { PARAMS, psi } from '../js/psi.js';

const t = PARAMS.tFallback;
const { xs, re, im } = psi(t);
const N = xs.length;

const W = 1200, H = 560;
const left = 70, right = 1150, cy = 272;
const ex = (right - left) / (PARAMS.xMax - PARAMS.xMin);
const eRe = [0, -210];
const eIm = [70, 55];
const sx = (x) => left + (x - PARAMS.xMin) * ex;
const proj = (x, r, i) => [sx(x) + r * eRe[0] + i * eIm[0], cy + r * eRe[1] + i * eIm[1]];
const f = (v) => v.toFixed(1);
const INK = 'var(--line, #7A1E2C)';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let q = Math.imul(a ^ (a >>> 15), 1 | a);
    q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
    return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
  };
}
function makeTake(seed, n, amp) {
  const rnd = mulberry32(seed);
  const terms = 3, dx = new Float64Array(n), dy = new Float64Array(n);
  const k = [], ph = [], a = [];
  for (let j = 0; j < terms * 2; j++) { k.push(0.015 + rnd() * 0.09); ph.push(rnd() * Math.PI * 2); a.push(amp * (0.4 + rnd() * 0.8)); }
  for (let i = 0; i < n; i++) {
    let sx_ = 0, sy_ = 0;
    for (let j = 0; j < terms; j++) { sx_ += a[j] * Math.sin(k[j] * i + ph[j]); sy_ += a[j + terms] * Math.sin(k[j + terms] * i + ph[j + terms]); }
    dx[i] = sx_; dy[i] = sy_;
  }
  return { dx, dy };
}
const take = makeTake(11, N, 3.2), ghost = makeTake(101, N, 5.0), axisTake = makeTake(201, 64, 2.0);

let out = '';
out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wp-title wp-desc" class="wp-frame">`;
out += `<title id="wp-title">Free Gaussian wavepacket at t = ${t.toFixed(2)}</title>`;
out += `<desc id="wp-desc">A hand-drawn helix along x with the real and imaginary parts of psi as the two transverse axes, inside a wireframe envelope of radius |psi|. The packet is centred near x = ${(PARAMS.k0 * t).toFixed(1)}.</desc>`;

// envelope wireframe: rings and longitudinal lines
let rings = '';
for (let i = 0; i < N; i += 12) {
  const r = Math.hypot(re[i], im[i]);
  if (r < 0.03) continue;
  for (let k = 0; k <= 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    const [px, py] = proj(xs[i], r * Math.cos(a), r * Math.sin(a));
    rings += `${k ? 'L' : 'M'}${f(px + take.dx[i])} ${f(py + take.dy[i])}`;
  }
  rings += 'Z';
}
out += `<path d="${rings}" fill="none" stroke="${INK}" stroke-opacity="0.3" stroke-width="1"/>`;
let longs = '';
for (let j = 0; j < 8; j++) {
  const a = (j / 8) * Math.PI * 2;
  let d = '';
  for (let i = 0; i < N; i += 3) {
    const r = Math.hypot(re[i], im[i]);
    const [px, py] = proj(xs[i], r * Math.cos(a), r * Math.sin(a));
    d += `${d ? 'L' : 'M'}${f(px + take.dx[i])} ${f(py + take.dy[i])}`;
  }
  longs += d;
}
out += `<path d="${longs}" fill="none" stroke="${INK}" stroke-opacity="0.2" stroke-width="1"/>`;

// axis: one shaky line
let axis = '';
for (let i = 0; i < 64; i++) {
  const x = PARAMS.xMin + (PARAMS.xMax + 0.4 - PARAMS.xMin) * (i / 63);
  const [px, py] = proj(x, 0, 0);
  axis += `${i ? 'L' : 'M'}${f(px + axisTake.dx[i])} ${f(py + axisTake.dy[i])}`;
}
out += `<path d="${axis}" fill="none" stroke="${INK}" stroke-opacity="0.6" stroke-width="1"/>`;

// the curve: a faint second stroke under the main 1px line
let peak = 1e-9;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.hypot(re[i], im[i]));
for (const [tk, op] of [[ghost, 0.32], [take, 0.95]]) {
  let d = '';
  for (let i = 0; i < N; i++) {
    const [px, py] = proj(xs[i], re[i], im[i]);
    const damp = 0.2 + 0.8 * Math.hypot(re[i], im[i]) / peak;
    d += `${i ? 'L' : 'M'}${f(px + tk.dx[i] * damp)} ${f(py + tk.dy[i] * damp)}`;
  }
  out += `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity="${op}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/>`;
}
out += `</svg>`;

writeFileSync(new URL('../assets/wavepacket-frame.svg', import.meta.url), out + '\n');
console.log(`wrote assets/wavepacket-frame.svg  (t=${t}, bytes=${out.length})`);

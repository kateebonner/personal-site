// Renders the static figure of psi(x, t) at PARAMS.tFallback as a technical drawing in SVG:
// medium ink curve, thin-line wireframe envelope with section hatching, dash-dot center
// line for the x axis, and a dimension line reading 2σ. Output: assets/wavepacket-frame.svg.
// Run: node _tools/render-frame.mjs
import { writeFileSync } from 'node:fs';
import { PARAMS, psi, width } from '../js/psi.js';

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
const INK = 'var(--line, #111111)';
const LETTER = 'Share Tech, Saira, Helvetica Neue, Arial, sans-serif';
const MONO = 'Share Tech Mono, Menlo, Consolas, monospace';

let out = '';
out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wp-title wp-desc" class="wp-frame">`;
out += `<title id="wp-title">Free Gaussian wavepacket at t = ${t.toFixed(2)}</title>`;
out += `<desc id="wp-desc">A helix drawn along x with the real and imaginary parts of psi as the two transverse axes, inside a hatched envelope of radius |psi|, with a dimension line reading its width. The packet is centred near x = ${(PARAMS.k0 * t).toFixed(1)} with width ${width(t).toFixed(2)}.</desc>`;
out += `<defs><pattern id="wp-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${INK}" stroke-width="1"/></pattern></defs>`;

// envelope section band: hatched
const ext = Math.hypot(eRe[1], eIm[1]);
let top = '', bot = '';
for (let i = 0; i < N; i++) {
  const r = Math.hypot(re[i], im[i]);
  const x = sx(xs[i]);
  top += `${i ? 'L' : 'M'}${f(x)} ${f(cy - r * ext)}`;
  bot = `L${f(x)} ${f(cy + r * ext)}` + bot;
}
out += `<path d="${top}${bot}Z" fill="url(#wp-hatch)" stroke="none"/>`;

// wireframe: rings and longitudinal construction lines
let rings = '';
for (let i = 0; i < N; i += 12) {
  const r = Math.hypot(re[i], im[i]);
  if (r < 0.03) continue;
  for (let k = 0; k <= 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    const [px, py] = proj(xs[i], r * Math.cos(a), r * Math.sin(a));
    rings += `${k ? 'L' : 'M'}${f(px)} ${f(py)}`;
  }
  rings += 'Z';
}
out += `<path d="${rings}" fill="none" stroke="${INK}" stroke-opacity="0.7" stroke-width="1"/>`;
let longs = '';
for (let j = 0; j < 8; j++) {
  const a = (j / 8) * Math.PI * 2;
  let d = '';
  for (let i = 0; i < N; i += 3) {
    const r = Math.hypot(re[i], im[i]);
    const [px, py] = proj(xs[i], r * Math.cos(a), r * Math.sin(a));
    d += `${d ? 'L' : 'M'}${f(px)} ${f(py)}`;
  }
  longs += d;
}
out += `<path d="${longs}" fill="none" stroke="${INK}" stroke-opacity="0.5" stroke-width="1"/>`;

// axes: x as a dash-dot center line, Re and Im thin solid
const [ax0x, ax0y] = proj(PARAMS.xMin, 0, 0);
const [ax1x, ax1y] = proj(PARAMS.xMax + 0.4, 0, 0);
out += `<path d="M${f(ax0x)} ${f(ax0y)}L${f(ax1x)} ${f(ax1y)}" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="14 5 2 5"/>`;
const org = proj(PARAMS.xMin, 0, 0);
const reTip = proj(PARAMS.xMin, 1.0, 0);
const imTip = proj(PARAMS.xMin, 0, 1.0);
out += `<g stroke="${INK}" stroke-width="1" fill="none"><path d="M${f(org[0])} ${f(org[1])}L${f(reTip[0])} ${f(reTip[1])}"/><path d="M${f(org[0])} ${f(org[1])}L${f(imTip[0])} ${f(imTip[1])}"/></g>`;

// the curve: medium line
let spiral = '';
for (let i = 0; i < N; i++) {
  const [px, py] = proj(xs[i], re[i], im[i]);
  spiral += `${i ? 'L' : 'M'}${f(px)} ${f(py)}`;
}
out += `<path d="${spiral}" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>`;

// dimension line: 2σ under the packet
const sig = width(t);
const xc = PARAMS.x0 + PARAMS.k0 * t;
const xa = sx(xc - 2 * sig), xb = sx(xc + 2 * sig);
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.hypot(re[i], im[i]));
const yd = cy + peak * ext + 34;
out += `<g stroke="${INK}" stroke-width="1" fill="none">`;
out += `<path d="M${f(xa)} ${f(cy + 8)}L${f(xa)} ${f(yd + 10)}"/><path d="M${f(xb)} ${f(cy + 8)}L${f(xb)} ${f(yd + 10)}"/>`;
out += `<path d="M${f(xa)} ${f(yd)}L${f(xb)} ${f(yd)}"/>`;
out += `</g>`;
out += `<path d="M${f(xa)} ${f(yd)}l16 -4l0 8z M${f(xb)} ${f(yd)}l-16 -4l0 8z" fill="${INK}"/>`;
const dimText = `2σ = ${(2 * sig).toFixed(2)}`;
out += `<text x="${f((xa + xb) / 2)}" y="${f(yd - 8)}" font-family="${MONO}" font-size="16" fill="${INK}" text-anchor="middle" paint-order="stroke" stroke="var(--paper, #FFFFFF)" stroke-width="10" stroke-linejoin="round">${dimText}</text>`;

// axis labels
const lab = (x, y, text, anchor = 'start') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${LETTER}" font-size="18" letter-spacing="0.5" fill="${INK}" text-anchor="${anchor}" paint-order="stroke" stroke="var(--paper, #FFFFFF)" stroke-width="8" stroke-linejoin="round">${text}</text>`;
out += lab(ax1x + 10, ax1y + 6, 'x');
out += lab(reTip[0] - 8, reTip[1] - 10, 'Re ψ', 'end');
out += lab(imTip[0] + 12, imTip[1] + 18, 'Im ψ');
out += `</svg>`;

writeFileSync(new URL('../assets/wavepacket-frame.svg', import.meta.url), out + '\n');
console.log(`wrote assets/wavepacket-frame.svg  (t=${t}, 2σ=${(2 * sig).toFixed(2)}, bytes=${out.length})`);

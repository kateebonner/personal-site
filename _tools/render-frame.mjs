// Renders the static figure of psi(x, t) at PARAMS.tFallback as line-art SVG.
// Output: assets/wavepacket-frame.svg (also inlined into index.html and projects.html).
// Run: node _tools/render-frame.mjs
import { writeFileSync } from 'node:fs';
import { PARAMS, psi, width } from '../js/psi.js';

const t = PARAMS.tFallback;
const { xs, re, im } = psi(t);
const N = xs.length;

const W = 1200, H = 560;
const left = 70, right = 1150, cy = 292;
const ex = (right - left) / (PARAMS.xMax - PARAMS.xMin);   // px per x unit
const eRe = [0, -210];                                     // Re psi points up
const eIm = [70, 55];                                      // Im psi comes toward the viewer, down-right
const sx = (x) => left + (x - PARAMS.xMin) * ex;
const proj = (x, r, i) => [sx(x) + r * eRe[0] + i * eIm[0], cy + r * eRe[1] + i * eIm[1]];
const f = (v) => v.toFixed(1);

let out = '';
out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wp-title wp-desc" class="wp-frame">`;
out += `<title id="wp-title">Free Gaussian wavepacket at t = ${t.toFixed(2)}</title>`;
out += `<desc id="wp-desc">A spiral drawn along x with real and imaginary parts of psi as the two transverse axes, inside a translucent envelope of radius |psi|. The packet is centred near x = ${(PARAMS.k0 * t).toFixed(1)} with width ${width(t).toFixed(2)}.</desc>`;

// envelope band: vertical extent of the revolved surface at each x
const ext = Math.hypot(eRe[1], eIm[1]);
let top = '', bot = '';
for (let i = 0; i < N; i++) {
  const r = Math.hypot(re[i], im[i]);
  const x = sx(xs[i]);
  top += `${i ? 'L' : 'M'}${f(x)} ${f(cy - r * ext)}`;
  bot = `L${f(x)} ${f(cy + r * ext)}` + bot;
}
out += `<path d="${top}${bot}Z" fill="var(--ch-i, #1F77B4)" fill-opacity="0.10" stroke="none"/>`;

// cross-section rings of the envelope
for (let i = 0; i < N; i += 12) {
  const r = Math.hypot(re[i], im[i]);
  if (r < 0.03) continue;
  let d = '';
  for (let k = 0; k <= 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    const [px, py] = proj(xs[i], r * Math.cos(a), r * Math.sin(a));
    d += `${k ? 'L' : 'M'}${f(px)} ${f(py)}`;
  }
  out += `<path d="${d}Z" fill="none" stroke="var(--ch-i, #1F77B4)" stroke-opacity="0.28" stroke-width="1"/>`;
}

// axes
const [ax0x, ax0y] = proj(PARAMS.xMin, 0, 0);
const [ax1x, ax1y] = proj(PARAMS.xMax + 0.4, 0, 0);
out += `<g stroke="var(--ink, #14161A)" stroke-width="1" fill="none">`;
out += `<path d="M${f(ax0x)} ${f(ax0y)}L${f(ax1x)} ${f(ax1y)}"/>`;
const org = proj(PARAMS.xMin, 0, 0);
const reTip = proj(PARAMS.xMin, 1.0, 0);
const imTip = proj(PARAMS.xMin, 0, 1.0);
out += `<path d="M${f(org[0])} ${f(org[1])}L${f(reTip[0])} ${f(reTip[1])}"/>`;
out += `<path d="M${f(org[0])} ${f(org[1])}L${f(imTip[0])} ${f(imTip[1])}"/>`;
out += `</g>`;

// the spiral
let spiral = '';
for (let i = 0; i < N; i++) {
  const [px, py] = proj(xs[i], re[i], im[i]);
  spiral += `${i ? 'L' : 'M'}${f(px)} ${f(py)}`;
}
out += `<path d="${spiral}" fill="none" stroke="var(--ch-i, #1F77B4)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;

// labels (Barlow via the page stylesheet; system sans fallback inside the SVG)
const lab = (x, y, text, anchor = 'start') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Barlow, system-ui, sans-serif" font-size="18" fill="var(--ink, #14161A)" text-anchor="${anchor}">${text}</text>`;
out += lab(ax1x + 10, ax1y + 6, 'x');
out += lab(reTip[0] - 8, reTip[1] - 10, 'Re ψ', 'end');
out += lab(imTip[0] + 12, imTip[1] + 18, 'Im ψ');
out += `</svg>`;

writeFileSync(new URL('../assets/wavepacket-frame.svg', import.meta.url), out + '\n');
console.log(`wrote assets/wavepacket-frame.svg  (t=${t}, width=${width(t).toFixed(3)}, bytes=${out.length})`);

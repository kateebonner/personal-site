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
const INK = 'var(--line, #7A1E2C)';
const LETTER = 'Share Tech, Saira, Helvetica Neue, Arial, sans-serif';
const MONO = 'Share Tech Mono, Menlo, Consolas, monospace';

let out = '';
out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wp-title wp-desc" class="wp-frame">`;
out += `<title id="wp-title">Free Gaussian wavepacket at t = ${t.toFixed(2)}</title>`;
out += `<desc id="wp-desc">A helix drawn along x with the real and imaginary parts of psi as the two transverse axes. The packet is centred near x = ${(PARAMS.k0 * t).toFixed(1)} with width ${width(t).toFixed(2)}.</desc>`;
out += ``;

// axis: one thin line
const [ax0x, ax0y] = proj(PARAMS.xMin, 0, 0);
const [ax1x, ax1y] = proj(PARAMS.xMax + 0.4, 0, 0);
out += `<path d="M${f(ax0x)} ${f(ax0y)}L${f(ax1x)} ${f(ax1y)}" fill="none" stroke="${INK}" stroke-opacity="0.55" stroke-width="1"/>`;

// the curve: medium line
let spiral = '';
for (let i = 0; i < N; i++) {
  const [px, py] = proj(xs[i], re[i], im[i]);
  spiral += `${i ? 'L' : 'M'}${f(px)} ${f(py)}`;
}
out += `<path d="${spiral}" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>`;

out += `</svg>`;

writeFileSync(new URL('../assets/wavepacket-frame.svg', import.meta.url), out + '\n');
console.log(`wrote assets/wavepacket-frame.svg  (t=${t}, bytes=${out.length})`);

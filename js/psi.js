// Free-particle Gaussian wavepacket in units where hbar = m = 1, in the form Kate's 2023
// animation used (her momentum-space derivation with a constant prefactor and without the
// p0^2 term), reproduced literally at her request:
//
//   psi(x, t) = C exp( -(x - x0)^2 / (4 s0^2 c) + i k0 (x - x0) / c ),   c = 1 + i t / (2 s0^2)
//   C = sqrt(pi) / s0  (the t = 0 value of the exact prefactor)
//
// Shape, motion (centre at x0 + k0 t), spreading (width s(t) = s0 sqrt(1 + (t / 2 s0^2)^2)),
// and phase are those of the exact solution. The amplitude is not: the exact prefactor falls
// as (1 + (t / 2 s0^2)^2)^(-1/4), so this psi's norm grows as the packet spreads.
//
// The same module runs in the browser (the live figure) and in node (the static frame).

export const PARAMS = Object.freeze({
  x0: 0,
  sigma0: 0.35355339,   // position width at t = 0: hbar / (sqrt 2 * sigma_p) with sigma_p = 2
  k0: 1,                // mean momentum p0 (hbar = m = 1), so the centre moves at speed 1
  xMin: -18,
  xMax: 28,
  samples: 600,
  T: 5,                 // the loop runs t from 0 to T and back
  loopSeconds: 16,      // wall-clock seconds for the full there-and-back
  tFallback: 1.5,       // the frame used for the static image and the preview
});

export function width(t, p = PARAMS) {
  const a = t / (2 * p.sigma0 * p.sigma0);
  return p.sigma0 * Math.sqrt(1 + a * a);
}

export function peak(t, p = PARAMS) {
  const tau = t / (2 * p.sigma0 * p.sigma0);
  return (Math.sqrt(Math.PI) / p.sigma0) * Math.exp((p.k0 * p.k0 * t * t) / (4 * p.sigma0 * p.sigma0 * (1 + tau * tau)));
}

export function makeBuffers(p = PARAMS) {
  return { xs: new Float64Array(p.samples), re: new Float64Array(p.samples), im: new Float64Array(p.samples) };
}

// Evaluates psi(x, t) on the fixed grid. Writes into `out` when given.
export function psi(t, p = PARAMS, out = makeBuffers(p)) {
  const N = p.samples;
  const { xs, re, im } = out;
  const s2 = p.sigma0 * p.sigma0;
  const tau = t / (2 * s2);
  const inv = 1 / (1 + tau * tau);        // 1 / c = (1 - i tau) / (1 + tau^2)
  const C = Math.sqrt(Math.PI) / p.sigma0;
  const dx = (p.xMax - p.xMin) / (N - 1);
  for (let i = 0; i < N; i++) {
    const x = p.xMin + i * dx;
    xs[i] = x;
    const d = x - p.x0;
    const g = (d * d) / (4 * s2);
    const er = (-g + p.k0 * d * tau) * inv;
    const ei = (g * tau + p.k0 * d) * inv;
    const mag = C * Math.exp(er);
    re[i] = mag * Math.cos(ei);
    im[i] = mag * Math.sin(ei);
  }
  return out;
}

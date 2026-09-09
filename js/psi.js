// Free-particle Gaussian wavepacket, closed form, in units where hbar = m = 1.
//
//   psi(x, 0) = (2 pi s0^2)^(-1/4) exp( -(x - x0)^2 / (4 s0^2) + i k0 (x - x0) )
//   psi(x, t) = (2 pi s0^2)^(-1/4) c^(-1/2)
//               exp( -(x - x0 - k0 t)^2 / (4 s0^2 c) + i k0 (x - x0) - i k0^2 t / 2 )
//   c = 1 + i t / (2 s0^2),   width  s(t) = s0 sqrt(1 + (t / (2 s0^2))^2)
//
// The same module runs in the browser (the live figure) and in node (the static frame).

export const PARAMS = Object.freeze({
  x0: 0,
  sigma0: 0.5,
  k0: 8,
  xMin: -3,
  xMax: 13,
  samples: 600,
  T: 1.2,            // loop period in the equation's time units
  loopSeconds: 14,   // wall-clock seconds per loop
  blendStart: 0.9,   // fraction of the loop where the cross-fade to t = 0 begins
  tFallback: 0.45,   // the frame used for reduced motion, no WebGL, Projects, and the preview image
});

export function width(t, p = PARAMS) {
  const a = t / (2 * p.sigma0 * p.sigma0);
  return p.sigma0 * Math.sqrt(1 + a * a);
}

export function peak(t, p = PARAMS) {
  return Math.pow(2 * Math.PI * width(t, p) ** 2, -0.25);
}

export function makeBuffers(p = PARAMS) {
  return { xs: new Float64Array(p.samples), re: new Float64Array(p.samples), im: new Float64Array(p.samples) };
}

// Evaluates psi(x, t) on the fixed grid. Writes into `out` when given.
export function psi(t, p = PARAMS, out = makeBuffers(p)) {
  const N = p.samples;
  const { xs, re, im } = out;
  const s2 = p.sigma0 * p.sigma0;
  const cr = 1;
  const ci = t / (2 * s2);
  const cmod2 = cr * cr + ci * ci;
  const cmod = Math.sqrt(cmod2);
  const carg = Math.atan2(ci, cr);
  const pref = Math.pow(2 * Math.PI * s2, -0.25) / Math.sqrt(cmod);
  const prefArg = -carg / 2;
  const invR = cr / cmod2;
  const invI = -ci / cmod2;
  const dx = (p.xMax - p.xMin) / (N - 1);
  const phaseT = 0.5 * p.k0 * p.k0 * t;
  for (let i = 0; i < N; i++) {
    const x = p.xMin + i * dx;
    xs[i] = x;
    const d = x - p.x0 - p.k0 * t;
    const g = -(d * d) / (4 * s2);
    const er = g * invR;
    const ei = g * invI + p.k0 * (x - p.x0) - phaseT;
    const mag = pref * Math.exp(er);
    const ph = ei + prefArg;
    re[i] = mag * Math.cos(ph);
    im[i] = mag * Math.sin(ph);
  }
  return out;
}

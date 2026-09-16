// The note's state spaces as pencil stop motion: Bloch spheres drawn with the same graphite
// brush as the home figure, ten frames a second, cycled hand-traced takes, moving with the
// paper as one sheet. Each figure is a small physical story:
//   s2   the classical bit: two poles; the X action hops the state between them
//   p1   the Pauli group: the octahedron turned by pi about x, then y, then z; two pairs swap, one stays
//   c1   the Clifford group: a walk 0 -> + -> +i -> - -> 1 -> - -> -i -> + -> 0 by H and S, one orbit of six
//   su2  a Lie group: the whole sphere turning, a state carried along a smooth path
//   row  Clifford (six points), Clifford + T (the orbit filling in), SU(2) (continuous)
// No third-party code. With reduced motion each figure holds one representative frame.
import { sketch } from './brush.js';

const INK = [122, 30, 44];
const FPS = 10;
const FONT = '"Be Vietnam Pro", system-ui, sans-serif';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- vectors on the Bloch sphere ----------
// Bloch coordinates: |0> = +z, |1> = -z, |+> = +x, |-> = -x, |+i> = +y, |-i> = -y. The camera sits
// near the +x side, turned by AZ toward +y and raised by EL above the equator, as in the notebook:
// |+> front and a little left, |-> behind and right, |+i> right, |-i> left, |0> up.
const EL = 0.5, AZ = 0.38;
const CE = Math.cos(EL), SE = Math.sin(EL), CA = Math.cos(AZ), SA = Math.sin(AZ);
const RIGHT = [-SA, CA, 0], UP = [-SE * CA, -SE * SA, CE], TOWARD = [CE * CA, CE * SA, SE];
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function rot(v, n, th) {   // Rodrigues: v turned by th about the unit axis n
  const c = Math.cos(th), s = Math.sin(th), d = dot(n, v) * (1 - c), x = cross(n, v);
  return [v[0] * c + x[0] * s + n[0] * d, v[1] * c + x[1] * s + n[1] * d, v[2] * c + x[2] * s + n[2] * d];
}
const depth = (v) => v[0] * TOWARD[0] + v[1] * TOWARD[1] + v[2] * TOWARD[2];   // > 0 faces the viewer
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const norm2 = (d) => { const l = Math.hypot(d[0], d[1]) || 1; return [d[0] / l, d[1] / l]; };

const STATES = { '0': [0, 0, 1], '1': [0, 0, -1], '+': [1, 0, 0], '−': [-1, 0, 0], '+i': [0, 1, 0], '−i': [0, -1, 0] };
const AX = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1], h: norm([1, 0, 1]) };
const GATE = { H: { n: AX.h, th: Math.PI }, S: { n: AX.z, th: Math.PI / 2 }, T: { n: AX.z, th: Math.PI / 4 } };

// ---------- the view: sphere centre and radius in CSS px ----------
function view(w, h, o = {}) {
  const R = o.R ?? Math.min(0.36 * w, 0.27 * h), cx = w / 2, cy = o.cy ?? h * 0.55;
  const P = (v) => [cx + (v[0] * RIGHT[0] + v[1] * RIGHT[1]) * R, cy - (v[0] * UP[0] + v[1] * UP[1] + v[2] * UP[2]) * R];
  return { R, cx, cy, P, fs: Math.max(10, Math.min(14, 0.04 * w)) };
}

// ---------- stroke builders ----------
function circle2d(p, r, k) { const pts = []; for (let i = 0; i <= k; i++) { const a = i / k * Math.PI * 2; pts.push([p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)]); } return pts; }
function lineS(p, q, k = 24, o = {}) { const pts = []; for (let i = 0; i <= k; i++) { const u = i / k; pts.push([p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]); } return { pts, weight: 'light', alpha: o.alpha ?? 0.5, width: o.width ?? 0.9 }; }
const dotS = (p, r = 2.1, alpha = 0.95) => ({ pts: circle2d(p, r, 12), weight: 'light', width: 4.0, alpha });
const ringS = (p, r = 9) => ({ pts: circle2d(p, r, 28), weight: 'graphite', scale: 1.2 });
const textS = (text, at, o = {}) => ({ text, at, size: o.size ?? 13, alpha: o.alpha ?? 0.9, align: o.align, baseline: o.baseline });
function headS(tip, dir, size = 7) {   // an arrowhead: two arms meeting at the tip, pointing along dir
  const [dx, dy] = dir, nx = -dy, ny = dx;
  const a = [tip[0] - dx * size + nx * size * 0.55, tip[1] - dy * size + ny * size * 0.55];
  const b = [tip[0] - dx * size - nx * size * 0.55, tip[1] - dy * size - ny * size * 0.55];
  return [lineS(a, tip, 6, { alpha: 0.95, width: 2.0 }), lineS(b, tip, 6, { alpha: 0.95, width: 2.0 })];
}
function labelAt(V, p, gap = 15) { const d = norm2([p[0] - V.cx, p[1] - V.cy]); return [p[0] + d[0] * gap, p[1] + d[1] * gap]; }
function frameS(w, h) {   // the hand-drawn frame around the panel, like the notebook's
  const m = 3, k = 40, g = (l) => ({ pts: l.pts, weight: 'graphite', scale: 1.7 });
  return [g(lineS([m, m], [w - m, m], k)), g(lineS([w - m, m], [w - m, h - m], k)), g(lineS([w - m, h - m], [m, h - m], k)), g(lineS([m, h - m], [m, m], k))];
}

// k points of the circle of radius r about centre c (3D) with normal n
function circleOn(n, r, c, k = 144) {
  const u = norm(Math.abs(n[2]) < 0.9 ? cross(n, [0, 0, 1]) : cross(n, [1, 0, 0])), w = cross(n, u), pts = [];
  for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); pts.push([c[0] + r * (u[0] * ca + w[0] * sa), c[1] + r * (u[1] * ca + w[1] * sa), c[2] + r * (u[2] * ca + w[2] * sa)]); }
  return pts;
}

// a closed loop of 3D points -> strokes: front runs solid, back runs lighter and dashed
function dashed2d(pts, alpha, width) { const out = []; for (let i = 0; i + 3 < pts.length; i += 18) out.push({ pts: pts.slice(i, i + 12), weight: 'light', alpha, width }); return out; }
function loopStrokes(V, pts3, o) {
  const n = pts3.length, d = pts3.map(depth), out = [];
  let start = 0;
  for (let i = 0; i < n; i++) if ((d[i] > 0) !== (d[(i - 1 + n) % n] > 0)) { start = i; break; }
  let run = [], front = d[start] > 0;
  const flush = () => {
    if (run.length >= 2) {
      if (o.ghost) out.push(...dashed2d(run.map(V.P), front ? o.front : o.back, o.width ?? 1.3));   // a ghost: dashed all round, front heavier
      else if (front || o.dashed === false) out.push({ pts: run.map(V.P), weight: 'light', alpha: front ? o.front : o.back, width: o.width ?? 1.3 });
      else out.push(...dashed2d(run.map(V.P), o.back, o.width ?? 1.3));
    }
    run = [];
  };
  for (let k = 0; k <= n; k++) {
    const i = (start + k) % n, f = d[i] > 0;
    if (f !== front) { run.push(pts3[i]); flush(); front = f; }
    run.push(pts3[i]);
  }
  flush();
  return out;
}
// an open path of 3D points -> runs split by depth: graphite in front, light behind
function pathStrokes(V, pts3, backAlpha = 0.3) {
  const out = []; let run = [], front = depth(pts3[0]) > 0;
  const flush = () => { if (run.length >= 2) out.push(front ? { pts: run.map(V.P), weight: 'graphite', scale: 1.5 } : { pts: run.map(V.P), weight: 'light', alpha: backAlpha, width: 1.2 }); run = []; };
  for (const v of pts3) { const f = depth(v) > 0; if (f !== front) { run.push(v); flush(); front = f; } run.push(v); }
  flush();
  return out;
}

function sphereWire(V, o, R3 = null) {
  const S = [];
  if (o.outline) S.push(...(o.ghost ? dashed2d(circle2d([V.cx, V.cy], V.R, 144), 0.75, 1.4) : [{ pts: circle2d([V.cx, V.cy], V.R, 96), weight: 'graphite', scale: 1.6 }]));
  const loops = [];
  for (const z of o.lats ?? []) loops.push(circleOn(AX.z, Math.sqrt(1 - z * z), [0, 0, z]));
  const m = o.mers ?? 0;
  for (let j = 0; j < m; j++) { const a = (j / m) * Math.PI + (o.merOffset ?? 0); loops.push(circleOn([Math.cos(a), Math.sin(a), 0], 1, [0, 0, 0])); }
  for (let loop of loops) { if (R3) loop = loop.map(R3); S.push(...loopStrokes(V, loop, o)); }
  return S;
}
function stateDots(V, o = {}) {
  const S = [];
  for (const k in STATES) {
    const v = STATES[k], p = V.P(v), f = depth(v) > 0;
    S.push(dotS(p, o.r ?? 1.7, f ? 0.95 : 0.55));
    if (o.labels !== false) S.push(textS(k, labelAt(V, p, o.gap ?? 15), { size: V.fs, alpha: f ? 0.9 : 0.6 }));
  }
  return S;
}

// ---------- the figures ----------
const OCT_EDGES = (() => { const N = Object.keys(STATES), E = []; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (dot(STATES[N[i]], STATES[N[j]]) > -0.5) E.push([N[i], N[j]]); return E; })();

// the Clifford + T orbit of |0>, in the order a breadth-first walk over words in H and T finds it
const CT_POINTS = (() => {
  const key = (v) => v.map((c) => Math.round(c * 300)).join(','), seen = new Set(), out = [], queue = [];
  for (const k in STATES) { const v = STATES[k]; seen.add(key(v)); out.push(v); queue.push(v); }
  while (out.length < 260 && queue.length) {
    const v = queue.shift();
    for (const g of [GATE.H, GATE.T]) { const w = rot(v, g.n, g.th), kk = key(w); if (!seen.has(kk)) { seen.add(kk); out.push(w); queue.push(w); } }
  }
  return out;
})();

// ---------- time helpers: one 12 s story per layer, each starting from the previous layer's picture ----------
const L = 12, FADE = 0.6;
const cut = (t) => { const e = Math.min(t, L - t), f = Math.max(0, Math.min(1, e / FADE)); return f * f * (3 - 2 * f); };   // ink across the loop cut
const ramp = (t, a, b) => ease((t - a) / (b - a));
const partial = (pts, u) => pts.slice(0, Math.max(2, Math.round(pts.length * u)));
// strokes appear one after another as u runs 0..1: each is drawn along its length, labels fade in
function stagger(S, u) {
  const k = S.length, out = [];
  for (let i = 0; i < k; i++) {
    const f = Math.max(0, Math.min(1, u * (k + 2) - i));
    if (f <= 0) break;
    const s = S[i];
    out.push(s.text != null ? { ...s, alpha: (s.alpha ?? 0.9) * f } : { ...s, pts: partial(s.pts, f) });
  }
  return out;
}
const faded = (S, f) => (f <= 0.01 ? [] : S.map((s) => (s.text != null ? { ...s, alpha: (s.alpha ?? 0.9) * f } : { ...s, fade: (s.fade ?? 1) * f })));
const poleMarks = (V) => { const top = V.P(STATES['0']), bot = V.P(STATES['1']); return [dotS(top), textS('0', [top[0], top[1] - 17], { size: V.fs }), dotS(bot), textS('1', [bot[0], bot[1] + 17], { size: V.fs })]; };
const equatorMarks = (V) => { const S = []; for (const k of ['+', '+i', '−', '−i']) { const v = STATES[k], p = V.P(v), f = depth(v) > 0; S.push(dotS(p, 2.1, f ? 0.95 : 0.55)); S.push(textS(k, labelAt(V, p), { size: V.fs, alpha: f ? 0.9 : 0.6 })); } return S; };
const GHOST = { lats: [-0.5, 0, 0.5], mers: 3, merOffset: 0.25, ghost: true, front: 0.65, back: 0.35, outline: 1 };
const SOLID = { lats: [0], mers: 1, merOffset: Math.PI / 2, front: 0.5, back: 0.3, outline: 1 };
const DENSE = { lats: [-0.85, -0.7, -0.55, -0.4, -0.25, -0.1, 0.05, 0.2, 0.35, 0.5, 0.65, 0.8], mers: 8, front: 0.4, back: 0.18, width: 1.0, dashed: false, outline: 0 };
// the octahedron's edges at the given vertex positions, back first
function octEdges(V, pos, fade = 1) {
  const edges = OCT_EDGES.map(([a, b]) => ({ a, b, d: depth(pos[a]) + depth(pos[b]) })).sort((p, q) => p.d - q.d);
  return edges.map((e) => { const l = lineS(V.P(pos[e.a]), V.P(pos[e.b]), 24, { alpha: 0.45, width: 1.1 }); return e.d > 0 ? { pts: l.pts, weight: 'graphite', scale: 1.4, fade } : { ...l, fade }; });
}
const REST = {}; for (const k in STATES) REST[k] = STATES[k];
// the Clifford walk: each step is the great-circle arc between two neighbouring axis states
const WALK = [['0', 'H'], ['+', 'S'], ['+i', 'S'], ['−', 'H'], ['1', 'H'], ['−', 'S'], ['−i', 'S'], ['+', 'H']];
const walkTarget = (i) => { const [from, gn] = WALK[i], g = GATE[gn]; return rot(STATES[from], g.n, g.th); };
const slerp = (a, b, u) => { const O = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))), sO = Math.sin(O) || 1; const p = Math.sin((1 - u) * O) / sO, q = Math.sin(u * O) / sO; return [a[0] * p + b[0] * q, a[1] * p + b[1] * q, a[2] * p + b[2] * q]; };
const walkArc = (i, uu, k = 36) => { const a = STATES[WALK[i][0]], b = walkTarget(i), pts = []; for (let j = 0; j <= k; j++) pts.push(slerp(a, b, uu * j / k)); return pts; };
const orbitArcs = (V, fade = 1) => WALK.map((_, i) => ({ pts: walkArc(i, 1).map(V.P), weight: 'light', alpha: 0.4, width: 1.3, fade }));
const ringAt = (V, v, fade = 1) => (depth(v) > 0 ? { ...ringS(V.P(v), 9), fade } : { pts: circle2d(V.P(v), 9, 28), weight: 'light', alpha: 0.5, width: 1.3, fade });
// a path in SU(2): a turn about z composed with a slower turn about x, both closing after 8 s
const OM = Math.PI * 2 / 8;
const turn = (v, tt) => rot(rot(v, AX.x, OM * tt), AX.z, 2 * OM * tt);

const FIGURES = {
  // just the hand-drawn frame, for the typeset generator panels beside the drawings
  frame: { L: 1, tFallback: 0, frame(t, w, h) { return frameS(w, h); } },

  // the classical bit: a boolean is two points; the sphere around them is only a ghost; X exchanges them
  s2: {
    L, tFallback: 8,
    frame(t, w, h) {
      const V = view(w, h), S = frameS(w, h);
      S.push(...stagger(poleMarks(V), ramp(t, 0.3, 1.8)));
      if (t > 2) S.push(...stagger(sphereWire(V, GHOST), ramp(t, 2, 4.2)));
      const top = V.P(STATES['0']), bot = V.P(STATES['1']);
      if (t > 4.2) S.push(...stagger([{ pts: lineS([V.cx, top[1] + 14], [V.cx, bot[1] - 14], 30).pts, weight: 'graphite', scale: 1.3 }, ...headS([V.cx, top[1] + 11], [0, -1]), ...headS([V.cx, bot[1] - 11], [0, 1])], ramp(t, 4.2, 5)));
      const hops = t < 5 ? 0 : Math.floor((t - 5) / 2) + 1;   // at 5, 7, 9, 11: ends back at 0
      S.push(ringS(hops % 2 ? bot : top, 8));
      return { strokes: S, ink: cut(t) };
    },
  },

  // the Pauli group: from the classical picture, four more states and the octahedron through all six; then three half turns
  p1: {
    L, tFallback: 11.8,
    frame(t, w, h) {
      const V = view(w, h), S = frameS(w, h);
      S.push(...sphereWire(V, GHOST), ...poleMarks(V));
      if (t > 1.5) S.push(...stagger(equatorMarks(V), ramp(t, 1.5, 3.5)));
      const axes = [AX.x, AX.y, AX.z], names = ['X', 'Y', 'Z'];
      const g = t < 5 ? -1 : Math.min(2, Math.floor((t - 5) / 2.3)), s = t - 5 - 2.3 * g;
      const th = g < 0 ? 0 : Math.PI * ease((s - 0.9) / 1.2);
      const place = (v) => { for (let k = 0; k < g; k++) v = rot(v, axes[k], Math.PI); return g < 0 ? v : rot(v, axes[g], th); };
      const pos = {}; for (const k in STATES) pos[k] = place(STATES[k]);
      if (t > 3.5) S.push(...stagger(octEdges(V, pos), ramp(t, 3.5, 5)));
      if (g >= 0) {
        const ax = axes[g];
        S.push(lineS(V.P(ax.map((c) => -1.18 * c)), V.P(ax.map((c) => 1.18 * c)), 40, { alpha: 0.5, width: 1.0 }));
        S.push(textS(names[g], [18, h - 22], { size: V.fs + 2, align: 'left' }));
      }
      // one marked state from each orbit rides the turns: the classical one from the start, the other two once their states exist
      S.push(ringAt(V, pos['0']));
      const f2 = ramp(t, 4.6, 5.2);
      if (f2 > 0) S.push(ringAt(V, pos['+'], f2), ringAt(V, pos['+i'], f2));
      return { strokes: S, ink: cut(t) };
    },
  },

  // the Clifford group: the sphere becomes real, the octahedron is no longer needed, and one state walks all six
  c1: {
    L, tFallback: 11.5,
    frame(t, w, h) {
      const V = view(w, h), S = frameS(w, h);
      const solid = ramp(t, 1.5, 3);
      S.push(...faded(sphereWire(V, GHOST), 1 - solid));
      if (solid > 0) S.push(...stagger(sphereWire(V, SOLID), solid));
      S.push(...faded(octEdges(V, REST), 1 - solid));
      S.push(...poleMarks(V), ...equatorMarks(V));
      const step = t < 3 ? -1 : Math.min(7, Math.floor(t - 3)), s = t - 3 - step, u = step < 0 ? 0 : ease((s - 0.45) / 0.55);
      for (let i = 0; i < step; i++) S.push({ pts: walkArc(i, 1).map(V.P), weight: 'light', alpha: 0.4, width: 1.3 });
      if (step === 7 && u >= 1) S.push({ pts: walkArc(7, 1).map(V.P), weight: 'light', alpha: 0.4, width: 1.3 });
      let here = STATES['0'];
      if (step >= 0 && u > 0.02 && !(step === 7 && u >= 1)) {
        const p3 = walkArc(step, u); S.push(...pathStrokes(V, p3));
        const p = p3.map(V.P), n = p.length; S.push(...headS(p[n - 1], norm2([p[n - 1][0] - p[n - 3][0], p[n - 1][1] - p[n - 3][1]])));
      }
      if (step >= 0) here = slerp(STATES[WALK[step][0]], walkTarget(step), u);
      S.push(ringAt(V, here));
      // the other two orbit markers from the Pauli layer vanish as the walker reaches them: three orbits become one
      if (t < 4) S.push(ringAt(V, STATES['+'], 1 - ramp(t, 3.7, 4)));
      if (t < 5) S.push(ringAt(V, STATES['+i'], 1 - ramp(t, 4.7, 5)));
      if (step >= 0) { const li = s >= 0.45 ? step : step - 1; if (li >= 0) S.push(textS(WALK[li][1], labelAt(V, V.P(walkArc(li, 1)[18]), 16), { size: V.fs })); }
      return { strokes: S, ink: cut(t) };
    },
  },

  // a Lie group: from the walked sphere, the whole surface fills in, then it turns and carries the state anywhere
  su2: {
    L, tFallback: 9,
    frame(t, w, h) {
      const V = view(w, h), S = frameS(w, h);
      const fill = ramp(t, 1.5, 4), leave = 1 - ramp(t, 2, 3.5), tt = Math.max(0, t - 4);
      const R3 = (v) => turn(v, tt);
      S.push(...sphereWire(V, { ...SOLID, outline: 1 }, R3));
      if (fill > 0) S.push(...stagger(sphereWire(V, DENSE, R3), fill));
      S.push(...faded(orbitArcs(V), leave));
      for (const k in STATES) { const v = R3(STATES[k]), f = depth(v) > 0; S.push(dotS(V.P(v), 2.1, (f ? 0.95 : 0.55) * (0.45 + 0.55 * leave))); if (leave > 0) S.push(textS(k, labelAt(V, V.P(v)), { size: V.fs, alpha: (f ? 0.9 : 0.6) * leave })); }
      const q = R3(STATES['0']);
      if (tt > 0) {
        const trail = []; for (let j = 0; j <= 40; j++) trail.push(turn(STATES['0'], Math.max(0, tt - 2.5 + 2.5 * j / 40)));
        S.push(...pathStrokes(V, trail));
        const p = trail.map(V.P), k = p.length;
        if (tt > 0.1) S.push(...headS(p[k - 1], norm2([p[k - 1][0] - p[k - 3][0], p[k - 1][1] - p[k - 3][1]])));
      }
      S.push(ringAt(V, q));
      return { strokes: S, ink: cut(t) };
    },
  },

  // the row: six points; the Clifford + T orbit filling in; the continuous sphere
  clifford: {
    L: 1, tFallback: 0,
    frame(t, w, h) {
      const V = view(w, h, { R: 0.42 * Math.min(w, h), cy: h / 2 });
      return [...sphereWire(V, { lats: [0], mers: 1, merOffset: Math.PI / 2, front: 0.5, back: 0.3, outline: 1 }), ...stateDots(V, { labels: false })];
    },
  },
  cliffordT: {
    L: 12, tFallback: 9,
    frame(t, w, h) {
      const V = view(w, h, { R: 0.42 * Math.min(w, h), cy: h / 2 });
      const S = sphereWire(V, { lats: [0], mers: 1, merOffset: Math.PI / 2, front: 0.5, back: 0.3, outline: 1 });
      const count = 6 + Math.floor((t / 12) * (CT_POINTS.length - 6));
      for (let i = 0; i < count; i++) { const v = CT_POINTS[i], f = depth(v) > 0; S.push(dotS(V.P(v), i < 6 ? 2.1 : 1.6, f ? 0.9 : 0.4)); }
      const u = t / 12, edge = Math.min(u, 1 - u), f = Math.min(1, edge / 0.06);
      return { strokes: S, ink: f * f * (3 - 2 * f) };
    },
  },
  su2small: {
    L: 12, tFallback: 3,
    frame(t, w, h) {
      const V = view(w, h, { R: 0.42 * Math.min(w, h), cy: h / 2 }), om = Math.PI * 2 / 12;
      const R3 = (v) => rot(rot(v, AX.x, om * t), AX.z, 2 * om * t);
      return sphereWire(V, { lats: [-0.85, -0.7, -0.55, -0.4, -0.25, -0.1, 0.05, 0.2, 0.35, 0.5, 0.65, 0.8], mers: 8, front: 0.4, back: 0.18, width: 1.0, dashed: false, outline: 1 }, R3);
    },
  },
};

// ---------- clocks, visibility, and the sheet ----------
const FIXED_T = new URLSearchParams(location.search).get('t');   // ?t=6.5 holds every figure at that moment, for review
function makeClock(L, tFallback) {
  let acc = 0, last = performance.now(), visible = true;
  return {
    setVisible(v) { visible = v; },
    now() { if (FIXED_T != null) return Math.min(L - 0.001, +FIXED_T); if (reduceMotion) return tFallback; const n = performance.now(); if (visible) acc += (n - last) / 1000; last = n; return acc % L; },
  };
}

export function mountAll() {
  // drawings move with the paper: each element turns about the viewport centre, in its own coordinates
  const bound = [...document.querySelectorAll('[data-sheet]')];
  const origins = () => {
    const vw = window.innerWidth / 2, vh = window.innerHeight / 2;
    for (const el of bound) { const r = el.getBoundingClientRect(); el.style.transformOrigin = `${(vw - r.left).toFixed(1)}px ${(vh - r.top).toFixed(1)}px`; }
  };
  document.querySelectorAll('.trio').forEach((el) => el.classList.add('is-live'));
  const clocks = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => { for (const e of entries) clocks.get(e.target)?.setVisible(e.isIntersecting); }, { rootMargin: '120px' }) : null;
  for (const fig of document.querySelectorAll('.ink-figure--live[data-figure]')) {
    const host = fig.querySelector('.ink-figure__mount'), def = FIGURES[fig.dataset.figure];
    if (!host || !def) continue;
    // only with the stylesheet that positions the mount; a stale or missing one leaves the still drawings in place
    if (getComputedStyle(host).position !== 'absolute') continue;
    fig.classList.add('is-live');
    const clock = makeClock(def.L, def.tFallback);
    clocks.set(host, clock);
    io?.observe(host);
    sketch(host, { ink: INK, fps: FPS, takes: 4, font: FONT, clock: () => clock.now(), frame: (t) => def.frame(t, host.clientWidth, host.clientHeight) });
  }
  if (!reduceMotion) {
    origins();
    window.addEventListener('scroll', origins, { passive: true });
    window.addEventListener('resize', origins);
    let last = -1;
    const tick = () => { const idx = Math.floor(performance.now() * FPS / 1000); if (idx !== last) { last = idx; origins(); } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
}

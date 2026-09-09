// The live figure, drawn like stop-motion animation traced by hand: psi(x, t) as a
// 1px ink line through (x, Re psi, Im psi) with a faint second stroke, inside a
// wireframe envelope r = |psi|, over one axis. Only ten frames are drawn per second,
// and each frame is a different hand-traced take, so the line boils frame to frame.
// Loaded after first paint by dynamic import; if Three.js cannot load or WebGL is
// unavailable the inline SVG frame stays in place.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PARAMS, psi, makeBuffers } from './psi.js';

const INK = 0x7a1e2c;
const AMP = 3.2;                                   // scene units per unit of psi
const XC = (PARAMS.xMin + PARAMS.xMax) / 2;
const N = PARAMS.samples;
const FPS = 10;                                    // drawn frames per second
const TAKES = 4;                                   // distinct hand-traced takes, cycled
const WOBBLE = 0.05;                               // scene units of hand shake on the line
const RING_EVERY = 12, RING_SEG = 36;
const LONG_LINES = 8, LONG_STEP = 3;
const AXIS_PTS = 64;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

// small seeded PRNG so every take is the same on every visit
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// smooth wobble along a polyline: a few sinusoids per axis with random phase
function makeTake(seed, n, amp) {
  const rnd = mulberry32(seed);
  const terms = 3, y = new Float32Array(n), z = new Float32Array(n);
  const k = [], ph = [], a = [];
  for (let j = 0; j < terms * 2; j++) { k.push(0.015 + rnd() * 0.09); ph.push(rnd() * Math.PI * 2); a.push(amp * (0.4 + rnd() * 0.8)); }
  for (let i = 0; i < n; i++) {
    let sy = 0, sz = 0;
    for (let j = 0; j < terms; j++) { sy += a[j] * Math.sin(k[j] * i + ph[j]); sz += a[j + terms] * Math.sin(k[j + terms] * i + ph[j + terms]); }
    y[i] = sy; z[i] = sz;
  }
  return { y, z };
}

export function mount(figure, host, clock) {
  if (!webglAvailable()) return false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 2, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.cssText = 'position:absolute;inset:0;';
  host.appendChild(renderer.domElement);

  const now = makeBuffers();
  const zero = psi(0);
  const cur = { re: new Float64Array(N), im: new Float64Array(N) };
  const takes = Array.from({ length: TAKES }, (_, i) => makeTake(11 + i * 7, N, WOBBLE));
  const ghostTakes = Array.from({ length: TAKES }, (_, i) => makeTake(101 + i * 7, N, WOBBLE * 1.6));
  const axisTakes = Array.from({ length: TAKES }, (_, i) => makeTake(201 + i * 7, AXIS_PTS, WOBBLE * 0.6));

  const line = (n, opacity) => {
    const pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { pos, geo, obj: new THREE.Line(geo, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity })) };
  };
  const segs = (n, opacity) => {
    const pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { pos, geo, obj: new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity })) };
  };

  const main = line(N, 0.95);
  const ghost = line(N, 0.32);
  const axis = line(AXIS_PTS, 0.6);
  const ringIdx = [];
  for (let i = 0; i < N; i += RING_EVERY) ringIdx.push(i);
  const rings = segs(ringIdx.length * RING_SEG * 2, 0.3);
  const nl = Math.floor((N - 1) / LONG_STEP);
  const longs = segs(LONG_LINES * nl * 2, 0.2);
  for (const o of [rings, longs, axis, ghost, main]) scene.add(o.obj);

  const x0 = PARAMS.xMin - XC, x1 = PARAMS.xMax - XC;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.minPolarAngle = 0.95;
  controls.maxPolarAngle = 1.75;
  controls.minAzimuthAngle = -0.7;
  controls.maxAzimuthAngle = 0.7;
  controls.target.set(0, 0.1, 0);
  camera.position.set(2.6, 3.4, 16);

  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const half = (x1 - x0) / 2 + 1.6;
    const dist = Math.max(half / camera.aspect, 2.4) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + 0.5;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
    camera.updateProjectionMatrix();
    controls.update();
    draw();
  }

  function fill(t, u, take) {
    psi(t, PARAMS, now);
    let s = 0;
    if (u >= PARAMS.blendStart) {
      const k = (u - PARAMS.blendStart) / (1 - PARAMS.blendStart);
      s = k * k * (3 - 2 * k);
    }
    for (let i = 0; i < N; i++) {
      cur.re[i] = now.re[i] + (zero.re[i] - now.re[i]) * s;
      cur.im[i] = now.im[i] + (zero.im[i] - now.im[i]) * s;
    }
    const w = takes[take], g = ghostTakes[take], ax = axisTakes[take];
    let peak = 1e-9;
    for (let i = 0; i < N; i++) peak = Math.max(peak, Math.hypot(cur.re[i], cur.im[i]));
    for (let i = 0; i < N; i++) {
      const x = now.xs[i] - XC, y = cur.re[i] * AMP, z = cur.im[i] * AMP;
      // the hand shakes with the stroke: near-straight runs stay close to the axis
      const d = 0.2 + 0.8 * Math.hypot(cur.re[i], cur.im[i]) / peak;
      main.pos[i * 3] = x; main.pos[i * 3 + 1] = y + w.y[i] * d; main.pos[i * 3 + 2] = z + w.z[i] * d;
      ghost.pos[i * 3] = x; ghost.pos[i * 3 + 1] = y + g.y[i] * d; ghost.pos[i * 3 + 2] = z + g.z[i] * d;
    }
    for (let i = 0; i < AXIS_PTS; i++) {
      const f = i / (AXIS_PTS - 1);
      axis.pos[i * 3] = x0 + (x1 + 0.4 - x0) * f; axis.pos[i * 3 + 1] = ax.y[i]; axis.pos[i * 3 + 2] = ax.z[i];
    }
    let q = 0;
    for (const i of ringIdx) {
      const r = Math.hypot(cur.re[i], cur.im[i]) * AMP;
      const x = now.xs[i] - XC;
      for (let j = 0; j < RING_SEG; j++) {
        const a0 = (j / RING_SEG) * Math.PI * 2, a1 = ((j + 1) / RING_SEG) * Math.PI * 2;
        rings.pos[q++] = x; rings.pos[q++] = r * Math.cos(a0) + w.y[i]; rings.pos[q++] = r * Math.sin(a0) + w.z[i];
        rings.pos[q++] = x; rings.pos[q++] = r * Math.cos(a1) + w.y[i]; rings.pos[q++] = r * Math.sin(a1) + w.z[i];
      }
    }
    let p = 0;
    for (let j = 0; j < LONG_LINES; j++) {
      const a = (j / LONG_LINES) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let i = 0; i + LONG_STEP < N && p < longs.pos.length; i += LONG_STEP) {
        const r0 = Math.hypot(cur.re[i], cur.im[i]) * AMP, r1 = Math.hypot(cur.re[i + LONG_STEP], cur.im[i + LONG_STEP]) * AMP;
        longs.pos[p++] = now.xs[i] - XC; longs.pos[p++] = r0 * ca + w.y[i]; longs.pos[p++] = r0 * sa + w.z[i];
        longs.pos[p++] = now.xs[i + LONG_STEP] - XC; longs.pos[p++] = r1 * ca + w.y[i + LONG_STEP]; longs.pos[p++] = r1 * sa + w.z[i + LONG_STEP];
      }
    }
    for (const o of [main, ghost, axis, rings, longs]) o.geo.attributes.position.needsUpdate = true;
  }

  function draw() { renderer.render(scene, camera); }

  // stop motion: draw at FPS, each drawn frame a different take
  let frameIdx = -1;
  clock.subscribe((t, u) => {
    const idx = reduceMotion ? 0 : Math.floor(performance.now() / (1000 / FPS));
    if (idx === frameIdx) return;
    frameIdx = idx;
    fill(t, u, idx % TAKES);
    draw();
  });
  controls.addEventListener('change', draw);
  new ResizeObserver(fit).observe(host);

  figure.classList.add('is-live');
  fit();
  return true;
}

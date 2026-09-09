// The live figure, drawn as a technical drawing: psi(x, t) as a medium ink line through
// (x, Re psi, Im psi) inside a thin-line wireframe envelope r = |psi|, the x axis as a
// dash-dot center line, and a live dimension line reading the packet's width 2σ.
// Loaded after first paint by dynamic import; if Three.js cannot load or WebGL is
// unavailable the inline SVG frame stays in place.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { PARAMS, psi, makeBuffers, width } from './psi.js';

const INK = 0x111111;
const AMP = 3.2;                                   // scene units per unit of psi
const XC = (PARAMS.xMin + PARAMS.xMax) / 2;        // centre the x range on the origin
const N = PARAMS.samples;
const RING_EVERY = 12, RING_SEG = 36;
const LONG_LINES = 8, LONG_STEP = 3;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

const thin = (opacity) => new THREE.LineBasicMaterial({ color: INK, transparent: opacity < 1, opacity });

export function mount(figure, host, clock) {
  if (!webglAvailable()) return false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 2, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.cssText = 'position:absolute;inset:0;';
  host.appendChild(renderer.domElement);
  const labels = new CSS2DRenderer();
  labels.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  host.appendChild(labels.domElement);

  // buffers
  const now = makeBuffers();
  const zero = psi(0);
  const cur = { re: new Float64Array(N), im: new Float64Array(N) };

  // the curve: medium line
  const linePos = new Float32Array(N * 3);
  const lineGeo = new LineGeometry();
  lineGeo.setPositions(linePos);
  const lineMat = new LineMaterial({ color: INK, linewidth: 1.7, worldUnits: false });
  scene.add(new Line2(lineGeo, lineMat));

  // envelope wireframe: rings and longitudinal construction lines
  const ringIdx = [];
  for (let i = 0; i < N; i += RING_EVERY) ringIdx.push(i);
  const ringPos = new Float32Array(ringIdx.length * RING_SEG * 2 * 3);
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  scene.add(new THREE.LineSegments(ringGeo, thin(0.7)));

  const nl = Math.floor((N - 1) / LONG_STEP);
  const longPos = new Float32Array(LONG_LINES * nl * 2 * 3);
  const longGeo = new THREE.BufferGeometry();
  longGeo.setAttribute('position', new THREE.BufferAttribute(longPos, 3));
  scene.add(new THREE.LineSegments(longGeo, thin(0.5)));

  // axes: x as a dash-dot center line, Re and Im as thin solid lines
  const x0 = PARAMS.xMin - XC, x1 = PARAMS.xMax - XC;
  const seg = (a, b, mat) => {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), mat);
    l.computeLineDistances();
    return l;
  };
  const PERIOD = 0.72;
  scene.add(seg([x0, 0, 0], [x1 + 0.4, 0, 0], new THREE.LineDashedMaterial({ color: INK, dashSize: 0.5, gapSize: PERIOD - 0.5 })));
  scene.add(seg([x0 + 0.58, 0, 0], [x1 + 0.4, 0, 0], new THREE.LineDashedMaterial({ color: INK, dashSize: 0.06, gapSize: PERIOD - 0.06 })));
  scene.add(seg([x0, 0, 0], [x0, AMP, 0], thin(1)));
  scene.add(seg([x0, 0, 0], [x0, 0, AMP], thin(1)));
  const label = (text, pos, cls = 'wp-axis-label') => {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    const o = new CSS2DObject(el);
    o.position.set(...pos);
    scene.add(o);
    return { el, o };
  };
  label('x', [x1 + 0.9, 0, 0]);
  label('Re ψ', [x0, AMP + 0.35, 0]);
  label('Im ψ', [x0 + 0.9, -0.35, AMP + 0.7]);

  // dimension line: 2σ under the packet
  const dimPos = new Float32Array(3 * 2 * 3);     // dimension line + two extension lines
  const dimGeo = new THREE.BufferGeometry();
  dimGeo.setAttribute('position', new THREE.BufferAttribute(dimPos, 3));
  scene.add(new THREE.LineSegments(dimGeo, thin(1)));
  const arrowPos = new Float32Array(2 * 3 * 3);   // two filled triangles
  const arrowGeo = new THREE.BufferGeometry();
  arrowGeo.setAttribute('position', new THREE.BufferAttribute(arrowPos, 3));
  scene.add(new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide })));
  const dimLabel = label('2σ = 1.00', [0, 0, 0], 'wp-dim-label');

  // camera and controls
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
    labels.setSize(w, h);
    lineMat.resolution.set(w, h);
    camera.aspect = w / h;
    const half = (x1 - x0) / 2 + 1.6;
    const dist = Math.max(half / camera.aspect, 2.4) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + 0.5;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
    camera.updateProjectionMatrix();
    controls.update();
    draw();
  }

  function fill(t, u) {
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
    let peak = 0;
    for (let i = 0; i < N; i++) {
      linePos[i * 3] = now.xs[i] - XC;
      linePos[i * 3 + 1] = cur.re[i] * AMP;
      linePos[i * 3 + 2] = cur.im[i] * AMP;
      const r = Math.hypot(cur.re[i], cur.im[i]);
      if (r > peak) peak = r;
    }
    lineGeo.setPositions(linePos);
    let q = 0;
    for (const i of ringIdx) {
      const r = Math.hypot(cur.re[i], cur.im[i]) * AMP;
      const x = now.xs[i] - XC;
      for (let j = 0; j < RING_SEG; j++) {
        const a0 = (j / RING_SEG) * Math.PI * 2, a1 = ((j + 1) / RING_SEG) * Math.PI * 2;
        ringPos[q++] = x; ringPos[q++] = r * Math.cos(a0); ringPos[q++] = r * Math.sin(a0);
        ringPos[q++] = x; ringPos[q++] = r * Math.cos(a1); ringPos[q++] = r * Math.sin(a1);
      }
    }
    ringGeo.attributes.position.needsUpdate = true;
    let p = 0;
    for (let j = 0; j < LONG_LINES; j++) {
      const a = (j / LONG_LINES) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let i = 0; i + LONG_STEP < N && p < longPos.length; i += LONG_STEP) {
        const r0 = Math.hypot(cur.re[i], cur.im[i]) * AMP, r1 = Math.hypot(cur.re[i + LONG_STEP], cur.im[i + LONG_STEP]) * AMP;
        longPos[p++] = now.xs[i] - XC; longPos[p++] = r0 * ca; longPos[p++] = r0 * sa;
        longPos[p++] = now.xs[i + LONG_STEP] - XC; longPos[p++] = r1 * ca; longPos[p++] = r1 * sa;
      }
    }
    longGeo.attributes.position.needsUpdate = true;

    // dimension: centre and width of the rendered packet
    const sig = width(t) + (PARAMS.sigma0 - width(t)) * s;
    const xc = (PARAMS.x0 + PARAMS.k0 * t) + (PARAMS.x0 - (PARAMS.x0 + PARAMS.k0 * t)) * s - XC;
    const xa = xc - 2 * sig, xb = xc + 2 * sig;
    const yd = -peak * AMP - 0.6;
    const d = dimPos; let k = 0;
    d[k++] = xa; d[k++] = yd; d[k++] = 0;   d[k++] = xb; d[k++] = yd; d[k++] = 0;
    d[k++] = xa; d[k++] = -0.18; d[k++] = 0; d[k++] = xa; d[k++] = yd - 0.16; d[k++] = 0;
    d[k++] = xb; d[k++] = -0.18; d[k++] = 0; d[k++] = xb; d[k++] = yd - 0.16; d[k++] = 0;
    dimGeo.attributes.position.needsUpdate = true;
    const ah = 0.34, aw = 0.075; let m = 0;
    arrowPos[m++] = xa; arrowPos[m++] = yd; arrowPos[m++] = 0; arrowPos[m++] = xa + ah; arrowPos[m++] = yd + aw; arrowPos[m++] = 0; arrowPos[m++] = xa + ah; arrowPos[m++] = yd - aw; arrowPos[m++] = 0;
    arrowPos[m++] = xb; arrowPos[m++] = yd; arrowPos[m++] = 0; arrowPos[m++] = xb - ah; arrowPos[m++] = yd - aw; arrowPos[m++] = 0; arrowPos[m++] = xb - ah; arrowPos[m++] = yd + aw; arrowPos[m++] = 0;
    arrowGeo.attributes.position.needsUpdate = true;
    dimLabel.o.position.set(xc, yd + 0.3, 0);
    dimLabel.el.textContent = `2σ = ${(2 * sig).toFixed(2)}`;
  }

  function draw() {
    renderer.render(scene, camera);
    labels.render(scene, camera);
  }

  let lastU = -1;
  clock.subscribe((t, u) => {
    if (u === lastU) return;
    lastU = u;
    fill(t, u);
    draw();
  });
  controls.addEventListener('change', draw);
  new ResizeObserver(fit).observe(host);
  if (reduceMotion) controls.rotateSpeed = 0.6;

  figure.classList.add('is-live');
  fit();
  return true;
}

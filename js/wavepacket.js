// The live figure: psi(x, t) drawn as a line through (x, Re psi, Im psi) inside the
// surface of revolution r = |psi|. Loaded after first paint by dynamic import; if
// Three.js cannot load or WebGL is unavailable the inline SVG frame stays in place.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { PARAMS, psi, makeBuffers } from './psi.js';

const INK = 0x14161a, BLUE = 0x1f77b4;
const AMP = 3.2;                                   // scene units per unit of psi
const XC = (PARAMS.xMin + PARAMS.xMax) / 2;        // centre the x range on the origin
const N = PARAMS.samples;
const RING_EVERY = 12, RING_SEG = 36;
const SURF_STEP = 4, SURF_SEG = 32;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
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
  const labels = new CSS2DRenderer();
  labels.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  host.appendChild(labels.domElement);

  // buffers
  const now = makeBuffers();
  const zero = psi(0);
  const cur = { re: new Float64Array(N), im: new Float64Array(N) };

  // the line
  const linePos = new Float32Array(N * 3);
  const lineGeo = new LineGeometry();
  lineGeo.setPositions(linePos);
  const lineMat = new LineMaterial({ color: BLUE, linewidth: 2.4, worldUnits: false });
  const line = new Line2(lineGeo, lineMat);
  scene.add(line);

  // envelope surface of revolution, fixed topology
  const nx = Math.floor((N - 1) / SURF_STEP) + 1;
  const surfPos = new Float32Array(nx * (SURF_SEG + 1) * 3);
  const surfIdx = [];
  for (let i = 0; i < nx - 1; i++) for (let j = 0; j < SURF_SEG; j++) {
    const a = i * (SURF_SEG + 1) + j, b = a + SURF_SEG + 1;
    surfIdx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const surfGeo = new THREE.BufferGeometry();
  surfGeo.setAttribute('position', new THREE.BufferAttribute(surfPos, 3));
  surfGeo.setIndex(surfIdx);
  const surf = new THREE.Mesh(surfGeo, new THREE.MeshBasicMaterial({
    color: BLUE, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false,
  }));
  scene.add(surf);

  // rings, matching the static frame
  const ringIdx = [];
  for (let i = 0; i < N; i += RING_EVERY) ringIdx.push(i);
  const ringPos = new Float32Array(ringIdx.length * RING_SEG * 2 * 3);
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  scene.add(new THREE.LineSegments(ringGeo, new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.28 })));

  // axes and labels
  const x0 = PARAMS.xMin - XC, x1 = PARAMS.xMax - XC;
  const axisMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.9 });
  const seg = (a, b) => new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), axisMat);
  scene.add(seg([x0, 0, 0], [x1 + 0.4, 0, 0]));
  scene.add(seg([x0, 0, 0], [x0, AMP, 0]));
  scene.add(seg([x0, 0, 0], [x0, 0, AMP]));
  const label = (text, pos) => {
    const el = document.createElement('div');
    el.className = 'wp-axis-label';
    el.textContent = text;
    const o = new CSS2DObject(el);
    o.position.set(...pos);
    scene.add(o);
  };
  label('x', [x1 + 0.9, 0, 0]);
  label('Re ψ', [x0, AMP + 0.35, 0]);
  label('Im ψ', [x0 + 0.9, -0.35, AMP + 0.7]);

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
  const home = new THREE.Vector3(2.6, 3.4, 16);
  camera.position.copy(home);

  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    labels.setSize(w, h);
    lineMat.resolution.set(w, h);
    camera.aspect = w / h;
    // distance so the x extent (plus margins) fits the width
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
    for (let i = 0; i < N; i++) {
      linePos[i * 3] = now.xs[i] - XC;
      linePos[i * 3 + 1] = cur.re[i] * AMP;
      linePos[i * 3 + 2] = cur.im[i] * AMP;
    }
    lineGeo.setPositions(linePos);
    let p = 0;
    for (let i = 0; i < N; i += SURF_STEP) {
      const r = Math.hypot(cur.re[i], cur.im[i]) * AMP;
      const x = now.xs[i] - XC;
      for (let j = 0; j <= SURF_SEG; j++) {
        const a = (j / SURF_SEG) * Math.PI * 2;
        surfPos[p++] = x; surfPos[p++] = r * Math.cos(a); surfPos[p++] = r * Math.sin(a);
      }
    }
    surfGeo.attributes.position.needsUpdate = true;
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

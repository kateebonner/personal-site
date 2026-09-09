// The live figure: psi(x, t) as a single ink line through (x, Re psi, Im psi) over one
// thin axis. Loaded after first paint by dynamic import; if Three.js cannot load or
// WebGL is unavailable the inline SVG frame stays in place.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { PARAMS, psi, makeBuffers } from './psi.js';

const INK = 0x7a1e2c;
const AMP = 3.2;
const XC = (PARAMS.xMin + PARAMS.xMax) / 2;
const N = PARAMS.samples;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export function mount(figure, host, clock) {
  if (!webglAvailable()) return false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 2, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.cssText = 'position:absolute;inset:0;';
  host.appendChild(renderer.domElement);

  const now = makeBuffers();
  const zero = psi(0);

  const linePos = new Float32Array(N * 3);
  const lineGeo = new LineGeometry();
  lineGeo.setPositions(linePos);
  const lineMat = new LineMaterial({ color: INK, linewidth: 1.8, worldUnits: false });
  scene.add(new Line2(lineGeo, lineMat));

  const x0 = PARAMS.xMin - XC, x1 = PARAMS.xMax - XC;
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0, 0, 0), new THREE.Vector3(x1 + 0.4, 0, 0)]),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 })));

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
      linePos[i * 3] = now.xs[i] - XC;
      linePos[i * 3 + 1] = (now.re[i] + (zero.re[i] - now.re[i]) * s) * AMP;
      linePos[i * 3 + 2] = (now.im[i] + (zero.im[i] - now.im[i]) * s) * AMP;
    }
    lineGeo.setPositions(linePos);
  }

  function draw() { renderer.render(scene, camera); }

  let lastU = -1;
  clock.subscribe((t, u) => {
    if (u === lastU) return;
    lastU = u;
    fill(t, u);
    draw();
  });
  controls.addEventListener('change', draw);
  new ResizeObserver(fit).observe(host);

  figure.classList.add('is-live');
  fit();
  return true;
}

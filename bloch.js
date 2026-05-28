import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const container = document.getElementById('bloch-container');

const CREAM = 0xFDFBD4;
const SAGE  = 0xD9D7B6;
const OLIVE = 0x878672;

// ── Scene & camera ──────────────────────────────────────────────────────────
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(2.8, 1.8, 2.8);

// ── Renderers ───────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;';
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
container.appendChild(labelRenderer.domElement);

// ── Sphere body ─────────────────────────────────────────────────────────────
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(1, 48, 48),
  new THREE.MeshBasicMaterial({ color: OLIVE, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })
));

// ── Great circles (equator + two meridians) ─────────────────────────────────
function greatCircle(normalArr, opacity = 0.35) {
  const n = new THREE.Vector3(...normalArr).normalize();
  const u = new THREE.Vector3();
  const v = new THREE.Vector3();
  if (Math.abs(n.x) < 0.9) u.crossVectors(n, new THREE.Vector3(1, 0, 0)).normalize();
  else                      u.crossVectors(n, new THREE.Vector3(0, 1, 0)).normalize();
  v.crossVectors(n, u).normalize();

  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    pts.push(u.clone().multiplyScalar(Math.cos(a)).add(v.clone().multiplyScalar(Math.sin(a))));
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: OLIVE, transparent: true, opacity })
  );
}

scene.add(greatCircle([0, 1, 0], 0.9)); // equator
scene.add(greatCircle([1, 0, 0], 0.9)); // YZ meridian
scene.add(greatCircle([0, 0, 1], 0.9)); // XZ meridian

// ── Axes ────────────────────────────────────────────────────────────────────
function axisLine(a, b) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
    new THREE.LineBasicMaterial({ color: SAGE, transparent: true, opacity: 0.50 })
  );
}
scene.add(axisLine([-1.45, 0, 0], [1.45, 0, 0]));
scene.add(axisLine([0, -1.45, 0], [0, 1.45, 0]));
scene.add(axisLine([0, 0, -1.45], [0, 0, 1.45]));

// ── Labels ──────────────────────────────────────────────────────────────────
function label(text, pos) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = [
    'color:#D9D7B6',
    'font-size:0.68rem',
    'letter-spacing:0.10em',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Georgia,serif',
    'user-select:none',
  ].join(';');
  const obj = new CSS2DObject(el);
  obj.position.set(...pos);
  scene.add(obj);
}

label('|0⟩',  [0,     1.70,  0]);
label('|1⟩',  [0,    -1.70,  0]);
label('|+⟩',  [ 1.65,  0,    0]);
label('|-⟩',  [-1.65,  0,    0]);
label('|+i⟩', [0,      0,  -1.65]);
label('|-i⟩', [0,      0,   1.65]);

// ── State vector ─────────────────────────────────────────────────────────────
const arrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  0.97,
  CREAM,
  0.15,
  0.07
);
scene.add(arrow);

// ── OrbitControls ────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping    = true;
controls.dampingFactor    = 0.06;
controls.autoRotate       = true;
controls.autoRotateSpeed  = 0.5;
controls.enablePan        = false;
controls.minDistance      = 2.5;
controls.maxDistance      = 7;

// ── Resize ────────────────────────────────────────────────────────────────────
function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  labelRenderer.setSize(w, h);
}
resize();
window.addEventListener('resize', resize);

// ── Animation loop ────────────────────────────────────────────────────────────
const clock  = new THREE.Clock();
const THETA  = Math.PI / 3.5; // ~51° from Z (pole) — clearly visible cone

function animate() {
  requestAnimationFrame(animate);
  const t   = clock.getElapsedTime();
  const phi = t * 0.65;
  arrow.setDirection(new THREE.Vector3(
    Math.sin(THETA) * Math.cos(phi),
    Math.cos(THETA),
    Math.sin(THETA) * Math.sin(phi)
  ).normalize());
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

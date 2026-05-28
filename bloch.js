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
// canvasWrap takes all remaining height; btnRow sits below it in normal flow
const canvasWrap = document.createElement('div');
canvasWrap.style.cssText = 'flex:1;position:relative;min-height:0;';
container.appendChild(canvasWrap);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;';
canvasWrap.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
canvasWrap.appendChild(labelRenderer.domElement);

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
scene.add(greatCircle([0, 1, 0], 0.9));
scene.add(greatCircle([1, 0, 0], 0.9));
scene.add(greatCircle([0, 0, 1], 0.9));

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
const THETA         = Math.PI / 3.5;
const PRECESS_SPEED = 0.65; // rad/s around Bloch Z (Three.js Y)
const Y_UP          = new THREE.Vector3(0, 1, 0);

let stateDir = new THREE.Vector3(Math.sin(THETA), Math.cos(THETA), 0);
let gateAnim = null; // { axis, totalAngle, appliedAngle, elapsed, duration }

const arrow = new THREE.ArrowHelper(stateDir.clone(), new THREE.Vector3(), 0.97, CREAM, 0.15, 0.07);
scene.add(arrow);

// ── Gate definitions ──────────────────────────────────────────────────────────
// Axes in Three.js coords: Bloch X→(1,0,0), Bloch Y→(0,0,-1), Bloch Z→(0,1,0)
const S2 = 1 / Math.sqrt(2);
const GATES = [
  { label: 'X',  axis: new THREE.Vector3(1,  0,  0),        angle: Math.PI       },
  { label: 'Y',  axis: new THREE.Vector3(0,  0, -1),        angle: Math.PI       },
  { label: 'Z',  axis: new THREE.Vector3(0,  1,  0),        angle: Math.PI       },
  { label: 'H',  axis: new THREE.Vector3(S2, S2, 0),        angle: Math.PI       },
  { label: 'S',  axis: new THREE.Vector3(0,  1,  0),        angle: Math.PI / 2   },
  { label: 'S†', axis: new THREE.Vector3(0,  1,  0),        angle: -Math.PI / 2  },
  { label: 'T',  axis: new THREE.Vector3(0,  1,  0),        angle: Math.PI / 4   },
  { label: 'T†', axis: new THREE.Vector3(0,  1,  0),        angle: -Math.PI / 4  },
];

function easeInOut(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

function applyGate(gate) {
  if (gateAnim) return;
  gateAnim = { axis: gate.axis.clone(), totalAngle: gate.angle, appliedAngle: 0, elapsed: 0, duration: 0.55 };
}

// ── Gate buttons ──────────────────────────────────────────────────────────────
const btnRow = document.createElement('div');
btnRow.style.cssText = [
  'display:flex',
  'justify-content:center',
  'gap:4px',
  'white-space:nowrap',
  'padding:12px 0 4px',
].join(';');

GATES.forEach(gate => {
  const btn = document.createElement('button');
  btn.textContent = gate.label;
  const base = 'background:rgba(84,83,51,0.75);color:#FDFBD4;border:1px solid rgba(135,134,114,0.55);';
  btn.style.cssText = base + [
    'padding:3px 8px',
    'font-size:0.65rem',
    'letter-spacing:0.09em',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Georgia,serif',
    'cursor:pointer',
    'border-radius:3px',
    'backdrop-filter:blur(4px)',
    '-webkit-backdrop-filter:blur(4px)',
    'transition:background 0.15s',
  ].join(';');
  btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(135,134,114,0.55)'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(84,83,51,0.75)'; });
  btn.addEventListener('click', () => applyGate(gate));
  btnRow.appendChild(btn);
});
container.appendChild(btnRow); // sits below canvasWrap in flex-column

// ── OrbitControls ────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.06;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.5;
controls.enablePan       = false;
controls.enableZoom      = false;
controls.minDistance     = 2.5;
controls.maxDistance     = 7;

// ── Resize ────────────────────────────────────────────────────────────────────
function resize() {
  const w = canvasWrap.clientWidth;
  const h = canvasWrap.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  labelRenderer.setSize(w, h);
}
resize();
window.addEventListener('resize', () => { requestAnimationFrame(resize); });

// ── Animation loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (gateAnim) {
    gateAnim.elapsed += delta;
    const t  = Math.min(gateAnim.elapsed / gateAnim.duration, 1);
    const da = gateAnim.totalAngle * easeInOut(t) - gateAnim.appliedAngle;
    stateDir.applyAxisAngle(gateAnim.axis, da).normalize();
    gateAnim.appliedAngle += da;
    if (t >= 1) gateAnim = null;
  } else {
    stateDir.applyAxisAngle(Y_UP, PRECESS_SPEED * delta);
  }

  arrow.setDirection(stateDir);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- scene / camera / renderer ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d17);
scene.fog = new THREE.Fog(0x0b0d17, 14, 32);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(6, 4.5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.2, 0);
controls.enableDamping = true;
controls.update();

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0x9bb8ff, 0x1a1a2e, 0.9));

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(6, 10, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;   sun.shadow.camera.bottom = -8;
sun.shadow.bias = -0.0005;
scene.add(sun);

const rim = new THREE.PointLight(0x4fc3ff, 40, 20);
rim.position.set(-5, 4, -4);
scene.add(rim);

// ---------- floor ----------
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  new THREE.MeshStandardMaterial({ color: 0x151a2e, roughness: 0.85, metalness: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(24, 48, 0x3b4a7a, 0x242c4a);
grid.position.y = 0.002;
grid.material.transparent = true;
grid.material.opacity = 0.5;
scene.add(grid);

// ---------- materials ----------
const metal = (color, rough = 0.3, met = 0.7) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: met });

const M = {
  dark:   metal(0x2b2f45, 0.45, 0.8),
  steel:  metal(0xaab4c8, 0.25, 0.9),
  blue:   metal(0x2f7bff, 0.3, 0.6),
  teal:   metal(0x1fd1b2, 0.3, 0.6),
  orange: metal(0xff8a2b, 0.35, 0.5),
  joint:  metal(0xe8ecf5, 0.2, 0.95),
  glow:   new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00bcd4, emissiveIntensity: 1.5 }),
};

const mesh = (geo, material) => new THREE.Mesh(geo, material);
// cylinder lying along the Z axis (hinge pin)
const hinge = (r, len, material) => {
  const m = mesh(new THREE.CylinderGeometry(r, r, len, 32), material);
  m.rotation.x = Math.PI / 2;
  return m;
};

// =====================================================
// HIERARCHY
// scene - base - shoulder(group) - shoulderJoint - upperArm - elbow(group)
//   - elbowJoint - forearm - wrist(group) - wristJoint - palm - fingers
// =====================================================

// ---------- BASE (rotates around Y) ----------
const base = new THREE.Group();
scene.add(base);

const plate = mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.2, 48), M.dark);
plate.position.y = 0.1;
base.add(plate);

const baseBody = mesh(new THREE.CylinderGeometry(1.1, 1.4, 0.4, 48), M.steel);
baseBody.position.y = 0.4;
base.add(baseBody);

const baseRing = mesh(new THREE.TorusGeometry(1.12, 0.05, 16, 64), M.glow);
baseRing.rotation.x = Math.PI / 2;
baseRing.position.y = 0.62;
base.add(baseRing);

const turret = mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.35, 48), M.blue);
turret.position.y = 0.82;
base.add(turret);

// ---------- SHOULDER ----------
const shoulder = new THREE.Group();
shoulder.position.y = 1.15;
base.add(shoulder);

const shoulderJoint = new THREE.Group();
shoulderJoint.add(hinge(0.5, 0.9, M.joint));
const shoulderCap = hinge(0.28, 1.0, M.dark);
shoulderJoint.add(shoulderCap);
shoulder.add(shoulderJoint);

// ---------- UPPER ARM ----------
const upperArm = new THREE.Group();
shoulder.add(upperArm);

const uaBody = mesh(new THREE.CapsuleGeometry(0.3, 1.5, 12, 24), M.blue);
uaBody.position.y = 1.15;
upperArm.add(uaBody);

const uaStripe = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 32), M.glow);
uaStripe.position.y = 1.15;
upperArm.add(uaStripe);

// piston (decorative)
const piston = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16), M.steel);
piston.position.set(0, 1.15, 0.42);
upperArm.add(piston);

// ---------- ELBOW ----------
const elbow = new THREE.Group();
elbow.position.y = 2.4;
shoulder.add(elbow);

const elbowJoint = new THREE.Group();
elbowJoint.add(hinge(0.4, 0.8, M.joint));
elbowJoint.add(hinge(0.22, 0.9, M.dark));
elbow.add(elbowJoint);

// ---------- FOREARM ----------
const forearm = new THREE.Group();
elbow.add(forearm);

const faBody = mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.7, 32), M.teal);
faBody.position.y = 1.0;
forearm.add(faBody);

const faRing = mesh(new THREE.TorusGeometry(0.26, 0.04, 16, 40), M.glow);
faRing.rotation.x = Math.PI / 2;
faRing.position.y = 1.0;
forearm.add(faRing);

// ---------- WRIST ----------
const wrist = new THREE.Group();
wrist.position.y = 1.95;
elbow.add(wrist);

const wristJoint = new THREE.Group();
wristJoint.add(mesh(new THREE.SphereGeometry(0.27, 32, 32), M.joint));
wristJoint.add(hinge(0.14, 0.7, M.dark));
wrist.add(wristJoint);

// ---------- PALM ----------
const palm = new THREE.Group();
wrist.add(palm);

const palmBody = mesh(new THREE.BoxGeometry(0.95, 0.5, 0.3), M.orange);
palmBody.position.y = 0.45;
palm.add(palmBody);
// soften the palm corners with a cylinder cap
const palmTop = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.95, 24), M.orange);
palmTop.rotation.z = Math.PI / 2;
palmTop.scale.set(1, 1, 2);
palmTop.position.y = 0.7;
palm.add(palmTop);

// ---------- FINGERS (5 total: 4 fingers + thumb) ----------
const fingers = new THREE.Group();
fingers.position.y = 0.7;
palm.add(fingers);

const curlJoints = []; // {a, b, c}  a = knuckle, b = middle joint, c = tip joint

function makeFinger(len, radius, material) {
  const seg = len / 3;
  const root = new THREE.Group();

  const mk = (parent) => {
    const g = new THREE.Group();
    const cap = mesh(new THREE.CapsuleGeometry(radius, seg, 8, 16), material);
    cap.position.y = seg / 2 + radius * 0.4;
    g.add(cap);
    const knuckle = mesh(new THREE.SphereGeometry(radius * 1.05, 16, 16), M.joint);
    g.add(knuckle);
    parent.add(g);
    return g;
  };

  const a = mk(root);
  const b = mk(a);  b.position.y = seg + radius * 0.8;
  const c = mk(b);  c.position.y = seg + radius * 0.8;

  const tip = mesh(new THREE.SphereGeometry(radius * 0.9, 16, 16), M.glow);
  tip.position.y = seg + radius * 1.2;
  c.add(tip);

  curlJoints.push({ a, b, c });
  return root;
}

// four fingers
const fingerData = [
  { x: -0.34, len: 0.85, r: 0.075 },  // index
  { x: -0.115, len: 0.98, r: 0.078 }, // middle
  { x:  0.115, len: 0.9,  r: 0.075 }, // ring
  { x:  0.34, len: 0.72, r: 0.068 },  // pinky
];
for (const f of fingerData) {
  const finger = makeFinger(f.len, f.r, M.steel);
  finger.position.set(f.x, 0.0, 0);
  fingers.add(finger);
}

// thumb (on the side, angled outward)
const thumb = makeFinger(0.7, 0.09, M.steel);
thumb.position.set(0.5, -0.4, 0);
thumb.rotation.z = -0.85;
fingers.add(thumb);

// ---------- shadows ----------
scene.traverse((o) => {
  if (o.isMesh && o !== floor) { o.castShadow = true; o.receiveShadow = true; }
});

// ---------- input ----------
const keys = {};
addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const speed = 0.03;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let curl = 0.15; // 0 = open, 1 = closed

function applyCurl() {
  for (const j of curlJoints) {
    j.a.rotation.x = curl * 1.0;
    j.b.rotation.x = curl * 1.2;
    j.c.rotation.x = curl * 0.9;
  }
}
applyCurl();

// ---------- loop ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (keys['a']) base.rotation.y += speed;
  if (keys['d']) base.rotation.y -= speed;

  if (keys['w']) shoulder.rotation.z = clamp(shoulder.rotation.z - speed, -Math.PI / 2, Math.PI / 2);
  if (keys['s']) shoulder.rotation.z = clamp(shoulder.rotation.z + speed, -Math.PI / 2, Math.PI / 2);

  if (keys['arrowleft'])  elbow.rotation.z = clamp(elbow.rotation.z + speed, -2.5, 2.5);
  if (keys['arrowright']) elbow.rotation.z = clamp(elbow.rotation.z - speed, -2.5, 2.5);

  if (keys['arrowup'])    wrist.rotation.z = clamp(wrist.rotation.z + speed, -1.5, 1.5);
  if (keys['arrowdown'])  wrist.rotation.z = clamp(wrist.rotation.z - speed, -1.5, 1.5);

  if (keys['q']) { curl = clamp(curl - 0.02, 0, 1); applyCurl(); }
  if (keys['e']) { curl = clamp(curl + 0.02, 0, 1); applyCurl(); }

  // gentle pulsing glow
  M.glow.emissiveIntensity = 1.3 + Math.sin(t * 3) * 0.4;

  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
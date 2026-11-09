import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    100);
camera.position.set(6, 5, 8);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const control = new OrbitControls(camera, renderer.domElement);

// Rrafshi: dyshemeja y = 0 
const n = new THREE.Vector3(0, 1, 0);   // normal
const p0 = new THREE.Vector3(0, 0, 0);   // a point on the plane
const d = n.dot(p0);                    // d = n · p0  

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({ color: 0x2a3140 })
);
floor.rotation.x = -Math.PI / 2; //PlaneGeometry ehte vertikale me kt e shtrim horizontalish
floor.updateMatrixWorld(true);          // Raycaster e do këtë
scene.add(floor, new THREE.GridHelper(12, 12));

// Rrezja 
const o = new THREE.Vector3(2, 5, 1);                       // origjina
const dir = new THREE.Vector3(0.3, -1, 0.1).normalize();    // drejtimi

// Formula
const t = (d - n.dot(o)) / n.dot(dir);                      // t = (d - n·o) / (n·d)
const hit = o.clone().addScaledVector(dir, t);              // p = o + t·dir -- ray formula


// Vizatimi i rrezes dhe pikes
scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([o, hit]),
    new THREE.LineBasicMaterial({ color: 0xff4422 })
));

const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.18),
    new THREE.MeshBasicMaterial({ color: 0xffd700 })
);
dot.position.copy(hit);
scene.add(dot);

// Krahasimi me THREE.Raycaster 
const rcHit = new THREE.Raycaster(o, dir).intersectObject(floor)[0];
console.log('Formula:  ', hit.toArray().map(x => x.toFixed(3)));
console.log('Raycaster:', rcHit.point.toArray().map(x => x.toFixed(3)));

function animate() {
    requestAnimationFrame(animate)
    control.update();
    renderer.render(scene, camera);
}
animate()
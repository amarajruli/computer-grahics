import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshStandardMaterial({ color: 0xE8431C });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const geometryS = new THREE.SphereGeometry(1, 5, 5);
const materialS = new THREE.MeshStandardMaterial({ color: 0xE8431C });
const cubeS = new THREE.Mesh(geometryS, materialS);
cubeS.position.z = -3
scene.add(cubeS);

const light = new THREE.AmbientLight(0xffffff, 2.5)
scene.add(light);
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5)
scene.add(dirLight);

const control = new OrbitControls(camera, renderer.domElement);
function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.005
    cube.rotation.y += 0.005
    control.update();
    renderer.render(scene, camera);
}
animate()

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})
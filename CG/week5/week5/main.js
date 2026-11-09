import * as THREE from 'three';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

const aspect = window.innerWidth / window.innerHeight;

const prespectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
prespectiveCamera.position.set(2, 2, 10);
scene.add(prespectiveCamera);
prespectiveCamera.lookAt(0, 0, 0);

const size = 8;
const orthographic = new THREE.OrthographicCamera( -size * aspect, size * aspect, size, -size, 0.1, 100);
orthographic.position.set(0, 0, 10);
orthographic.lookAt(0, 0, 0);

const cameras = [prespectiveCamera, orthographic];
let current = 0;
console.log('Actove '
addEventListener('keydown', (event) => {
  if (event.key === 'SPACE') {
    scene.remove(prespectiveCamera);
scene.add(orthographic);
  }
});

const renderer = new THREE.WebGLRenderer((antialias = true));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 2.5);
dir.position.set(5, 8, 4);
scene.add(dir);

new PLYLOADER().load('week5/model/3DObject.ply', function (geo) {
  geo.center();
  const mesh = new THREE.Mesh(geo,new THREE.MeshStandardMaterial({ color: 0xdb7dac, roughness: 0.5 }));
  mesh.scale.setScalar(0.2);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, prespectiveCamera);
}

animate();
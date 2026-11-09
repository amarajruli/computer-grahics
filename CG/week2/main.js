import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1419);

const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    100);
camera.position.set(4, 4, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(new THREE.AxesHelper(3));

const control =new OrbitControls(camera, renderer.domElement);

//2
const origin = new THREE.Vector3(0, 0, 0);
const a = new THREE.Vector3(2, 1, 0);
const b = new THREE.Vector3(0, 2, 0);

const arrA = new THREE.ArrowHelper(a.clone().normalize(), origin, a.length(), 0xE8431C, 0.35, 0.2); 
const arrB = new THREE.ArrowHelper(b.clone().normalize(), origin, b.length(), 0x1E40FF, 0.35, 0.2);
scene.add(arrA, arrB);

//3
const sum = new THREE.Vector3().addVectors(a, b);  
const dot = a.dot(b);

const arrSum = new THREE.ArrowHelper(sum.clone().normalize(), origin, sum.length(), 0x3ecf8e, 0.35, 0.2);
scene.add(arrSum);

console.log('a+b =', sum, '  a·b =', dot);
const gui = new GUI();
const params = {
    aX: a.x, aY: a.y, aZ: a.z,
    bX: b.x, bY: b.y, bZ: b.z,
    sum: '',
    dot: '',
    cross: '',
    crossLength: '',
    angle: ''
};

// Vector A
const aFolder = gui.addFolder('Vector A');
aFolder.add(params, 'aX', -5, 5, 0.1).name('X').onChange(value => { a.x = value; updateVectors(); });
aFolder.add(params, 'aY', -5, 5, 0.1).name('Y').onChange(value => { a.y = value; updateVectors(); });
aFolder.add(params, 'aZ', -5, 5, 0.1).name('Z').onChange(value => { a.z = value; updateVectors(); });
aFolder.open();

// Vector B
const bFolder = gui.addFolder('Vector B');
bFolder.add(params, 'bX', -5, 5, 0.1).name('X').onChange(value => { b.x = value; updateVectors(); });
bFolder.add(params, 'bY', -5, 5, 0.1).name('Y').onChange(value => { b.y = value; updateVectors(); });
bFolder.add(params, 'bZ', -5, 5, 0.1).name('Z').onChange(value => { b.z = value; updateVectors(); });
bFolder.open();

// Results
const resultsFolder = gui.addFolder('Results');
resultsFolder.add(params, 'sum').name('a + b').disable();
resultsFolder.add(params, 'dot').name('a · b').disable();
resultsFolder.add(params, 'cross').name('a × b').disable();
resultsFolder.add(params, 'crossLength').name('‖a × b‖').disable();
resultsFolder.add(params, 'angle').name('θ').disable();
resultsFolder.open();

function updateVectors() {
    // Update arrows
    requestAnimationFrame(updateVectors)
    control.update()
    
    arrA.setDirection(a.clone().normalize());
    arrA.setLength(a.length(), 0.35, 0.2);
    arrB.setDirection(b.clone().normalize());
    arrB.setLength(b.length(), 0.35, 0.2);

    // a + b
    sum.addVectors(a, b);
    arrSum.setDirection(sum.clone().normalize());
    arrSum.setLength(sum.length(), 0.35, 0.2);

    // Dot product
    const dot = a.dot(b);

    // Cross product
    const cross = new THREE.Vector3().crossVectors(a, b);

    // Magnitude of cross product
    const crossLength = cross.length();

    // Angle 
    const cos = THREE.MathUtils.clamp(
        dot / (a.length() * b.length()),
        -1,
        1
    );

    const angle = THREE.MathUtils.radToDeg(Math.acos(cos));

    // Update GUI
    params.sum = `(${sum.x}, ${sum.y}, ${sum.z})`;
    params.dot = dot;

    params.cross = `(${cross.x}, ${cross.y}, ${cross.z})`;
    params.crossLength = crossLength;

    params.angle = `${angle}°`;

    // Tell GUI to refresh the displayed values
    resultsFolder.controllersRecursive().forEach(controller => {
        controller.updateDisplay();
    });

    renderer.render(scene, camera);
}
updateVectors()
import * as THREE from 'three'
import {
    OrbitControls,
    EffectComposer,
    RenderPass,
    UnrealBloomPass,
    OutputPass,
} from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(8, 10, 14)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// ---------- LIGHTS ----------
const pointLight = new THREE.PointLight(0xfff0d0, 400, 0, 1.6)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(pointLight, ambientLight)

// ---------- SUN ----------
const sunMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
            vPos = position;
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
        }
    `,
    fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                    mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                    mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                f.z);
        }
        float fbm(vec3 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec3 p = normalize(vPos) * 2.5;
            float n1 = fbm(p + vec3(0.0, uTime * 0.15, 0.0));
            float n2 = fbm(p * 2.0 - vec3(uTime * 0.1));
            float t = clamp(n1 * 0.7 + n2 * 0.5, 0.0, 1.0);

            vec3 dark = vec3(0.6, 0.1, 0.0);
            vec3 mid  = vec3(1.0, 0.45, 0.05);
            vec3 hot  = vec3(1.0, 0.9, 0.4);

            vec3 col = mix(dark, mid, smoothstep(0.2, 0.55, t));
            col = mix(col, hot, smoothstep(0.55, 0.9, t));

            // limb darkening: edges slightly darker
            float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.0);
            col *= 1.0 - fres * 0.35;

            col *= 2.0; // push brightness so bloom picks it up
            gl_FragColor = vec4(col, 1.0);
        }
    `,
})
const sun = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 48), sunMaterial)
scene.add(sun)

// Soft glow sprite around the sun
function makeGlowTexture() {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0.0, 'rgba(255, 200, 100, 0.9)')
    g.addColorStop(0.3, 'rgba(255, 120, 30, 0.35)')
    g.addColorStop(1.0, 'rgba(255, 60, 0, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
}
const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
    })
)
glow.scale.set(11, 11, 1)
sun.add(glow)

// ---------- EARTH ----------
const earthOrbit = new THREE.Object3D()
sun.add(earthOrbit)

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e40ff, roughness: 0.9 })
)
earth.position.x = 6
earthOrbit.add(earth)

// ---------- MOON (orbits Earth) ----------
const moonOrbit = new THREE.Object3D()
earth.add(moonOrbit)

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 1 })
)
moon.position.x = 1.6
moonOrbit.add(moon)

// ---------- MARS ----------
const marsOrbit = new THREE.Object3D()
sun.add(marsOrbit)

const mars = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xc1440e, roughness: 0.95 })
)
mars.position.x = 10
marsOrbit.add(mars)

// ---------- PHOBOS (orbits Mars) ----------
const phobosOrbit = new THREE.Object3D()
mars.add(phobosOrbit)

const phobos = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x8a7f78, roughness: 1 })
)
phobos.position.x = 1.0
phobosOrbit.add(phobos)

// ---------- POST-PROCESSING (bloom) ----------
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(
    new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2, // strength
        0.8, // radius
        0.6  // threshold
    )
)
composer.addPass(new OutputPass())

// ---------- LOOP ----------
const control = new OrbitControls(camera, renderer.domElement)
const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)
    control.update()
    sunMaterial.uniforms.uTime.value = clock.getElapsedTime()
    sun.rotation.y += 0.002

    earthOrbit.rotation.y += 0.01
    moonOrbit.rotation.y += 0.04

    marsOrbit.rotation.y += 0.006
    phobosOrbit.rotation.y += 0.08

    composer.render()
}
animate()

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
})
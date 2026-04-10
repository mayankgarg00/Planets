import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';

const loaderOverlay = document.getElementById('loader-overlay');

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  loaderOverlay.classList.add('hidden');
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 9;

const starTexture = new THREE.TextureLoader(loadingManager).load('/resources/stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;

const bigSphereGeometry = new THREE.SphereGeometry(16, 128, 128);
const bigSphereMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  transparent: true,
  opacity: 0.5,
  side: THREE.BackSide
});
const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
scene.add(bigSphere);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const radius = 1.5;
const segments = 64;
const orbitRadius = 4.7;

const planets = [
  {
    name: 'Earth',
    texture: '/resources/earth/map.jpg',
    description: 'Our home world — a blue marble of vast oceans, lush continents, and the only known harbor of life in the cosmos.',
    color: '#4fc3f7'
  },
  {
    name: 'Volcanic',
    texture: '/resources/venus/map.jpg',
    description: 'The scorching twin — shrouded in thick clouds of sulfuric acid, with surface temperatures hot enough to melt lead.',
    color: '#ffcc80'
  },
  {
    name: 'Csilla',
    texture: '/resources/csilla/color.png',
    description: 'A mysterious ice world drifting at the edge of its star system, hiding ancient secrets beneath its frozen crust.',
    color: '#b3e5fc'
  },
  {
    name: 'Venus',
    texture: '/resources/volcanic/color.png',
    description: 'A world of fire and fury — its surface reshaped constantly by colossal eruptions painting the sky in molten red.',
    color: '#ff7043'
  }
];

const planetOrder = [0, 1, 2, 3];

const spheres = new THREE.Group();

for (let i = 0; i < 4; i++) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const texture = textureLoader.load(planets[planetOrder[i]].texture);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture });

  material.map = texture;
  material.needsUpdate = true;

  const sphere = new THREE.Mesh(geometry, material);

  const angle = (i / 4) * Math.PI * 2;
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);

  spheres.add(sphere);
}

spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

const frontSlotSequence = [1, 2, 3, 0];
let currentStep = 0;

function rotateTo(step) {
  gsap.to(spheres.rotation, {
    y: step * (Math.PI / 2),
    duration: 2.5,
    ease: 'power1.inOut'
  });
}

function getCurrentPlanet() {
  const slot = frontSlotSequence[currentStep % 4];
  return planets[planetOrder[slot]];
}

function dispatchPlanetChange() {
  const planet = getCurrentPlanet();
  window.dispatchEvent(new CustomEvent('planetchange', { detail: planet }));
}

const AUTO_INTERVAL = 9000;
const ANIM_DURATION = 2500;

function startAutoRotate() {
  return setInterval(() => {
    currentStep++;
    rotateTo(currentStep);
    setTimeout(dispatchPlanetChange, 1200);
  }, AUTO_INTERVAL);
}

let autoRotateTimer = startAutoRotate();

window.addEventListener('load', () => {
  dispatchPlanetChange();
});

let wheelThrottleActive = false;

window.addEventListener('wheel', () => {
  if (!wheelThrottleActive) {
    wheelThrottleActive = true;

    clearInterval(autoRotateTimer);

    currentStep++;
    rotateTo(currentStep);
    setTimeout(dispatchPlanetChange, 1200);

    setTimeout(() => {
      wheelThrottleActive = false;
      autoRotateTimer = startAutoRotate();
    }, ANIM_DURATION);
  }
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
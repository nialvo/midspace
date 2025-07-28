const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Light for the sun
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(0, 0, 0);
scene.add(light);

// Load textures
const loader = new THREE.TextureLoader();
const sunTexture = loader.load('assets/s0.jpeg');
const planetTexture = loader.load('assets/p0.jpeg');

// SUN — place it at origin
const sunGeo = new THREE.SphereGeometry(5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.set(0, 0, 0);
scene.add(sun);

// PLANETS — now all within 60 units
const planets = [];
const planetNames = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const dist = 30 + i * 4;
  const geometry = new THREE.SphereGeometry(1.2, 16, 16);
  const material = new THREE.MeshBasicMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(dist * Math.cos(angle), 0, dist * Math.sin(angle));
  planet.userData = { name: planetNames[i] };
  planets.push(planet);
  scene.add(planet);
}

// 🕹️ JOYSTICK
let direction = new THREE.Vector3(0, 0, 0);

const joystick = nipplejs.create({
  zone: document.getElementById('joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: 'white'
});

joystick.on('move', (evt, data) => {
  if (data && data.vector) {
    direction.set(data.vector.x, 0, -data.vector.y).normalize().multiplyScalar(0.5);
  }
});

joystick.on('end', () => {
  direction.set(0, 0, 0);
});

// MARKERS — (removed for now to simplify test)

// 🚀 LOOP
function animate() {
  requestAnimationFrame(animate);

  // Move the camera
  camera.position.add(direction);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();
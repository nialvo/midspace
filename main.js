// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
const light = new THREE.PointLight(0xffffff, 2, 300);
light.position.set(0, 0, 0);
scene.add(light);

// Textures
const loader = new THREE.TextureLoader();
const sunTexture = loader.load('assets/s0.jpeg');
const planetTexture = loader.load('assets/p0.jpeg');

// Sun
const sunGeo = new THREE.SphereGeometry(5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planets
const planets = [];
const planetNames = ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"];
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const dist = 30 + i * 4;
  const geometry = new THREE.SphereGeometry(1.2, 16, 16);
  const material = new THREE.MeshBasicMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(dist * Math.cos(angle), 0, dist * Math.sin(angle));
  planet.userData = { name: planetNames[i] };
  scene.add(planet);
  planets.push(planet);
}

// Movement variables
let move = { x: 0, y: 0, z: 0, roll: 0 };

// Left joystick → pitch + yaw
const leftJoystick = nipplejs.create({
  zone: document.getElementById('left-joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: 'white'
});
leftJoystick.on('move', (evt, data) => {
  if (data.vector) {
    move.x = data.vector.x * 0.05; // yaw
    move.y = data.vector.y * -0.05; // pitch
  }
});
leftJoystick.on('end', () => {
  move.x = move.y = 0;
});

// Right joystick → forward/back + roll
const rightJoystick = nipplejs.create({
  zone: document.getElementById('right-joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: 'white'
});
rightJoystick.on('move', (evt, data) => {
  if (data.vector) {
    move.z = data.vector.y * -0.2;  // forward/back
    move.roll = data.vector.x * 0.03; // roll
  }
});
rightJoystick.on('end', () => {
  move.z = move.roll = 0;
});

// Animate loop
function animate() {
  requestAnimationFrame(animate);

  // Apply pitch and yaw
  camera.rotation.x += move.y;
  camera.rotation.y += move.x;

  // Apply roll
  camera.rotation.z += move.roll;

  // Move forward/backward in local space
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyEuler(camera.rotation).normalize();
  camera.position.add(forward.multiplyScalar(move.z));

  renderer.render(scene, camera);
}
animate();
// === SCENE SETUP ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === LIGHT & TEXTURES ===
const light = new THREE.PointLight(0xffffff, 2, 300);
light.position.set(0, 0, 0);
scene.add(light);

const loader = new THREE.TextureLoader();
const sunTexture = loader.load('assets/s0.jpeg');
const planetTexture = loader.load('assets/p0.jpeg');

// === SUN ===
const sunGeo = new THREE.SphereGeometry(5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// === PLANETS ===
const planets = [];
const planetNames = ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"];
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const dist = 30 + i * 8;
  const geometry = new THREE.SphereGeometry(1.2, 16, 16);
  const material = new THREE.MeshBasicMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(dist * Math.cos(angle), 0, dist * Math.sin(angle));
  planet.userData = { name: planetNames[i] };
  scene.add(planet);
  planets.push(planet);
}

// === STARFIELD ===
function createStarfield() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = [];

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 2000;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    starPositions.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createMilkyWayBand() {
  const bandGeometry = new THREE.BufferGeometry();
  const bandCount = 3000;
  const bandPositions = [];

  for (let i = 0; i < bandCount; i++) {
    const theta = Math.random() * 2 * Math.PI;
    // Restrict to ~±15° from equator
    const phi = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI / 6);
    const radius = 2000;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    bandPositions.push(x, y, z);
  }

  bandGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bandPositions, 3));
  const bandMaterial = new THREE.PointsMaterial({ color: 0xbbccff, size: 1.5 });
  const bandStars = new THREE.Points(bandGeometry, bandMaterial);
  scene.add(bandStars);
}

createStarfield();
createMilkyWayBand();

// === MOVEMENT VARIABLES WITH FULL INERTIA ===
let angularVelocity = new THREE.Vector3(0, 0, 0); // pitch, yaw, roll rates
let angularTarget = new THREE.Vector3(0, 0, 0);
let velocity = new THREE.Vector3(0, 0, 0);        // linear velocity
let thrustTarget = 0;

const angularAccel = 0.05;
const angularDamping = 0.99;
const thrustAccel = 0.01;
const linearDamping = 0.999;

// === LEFT JOYSTICK → pitch + yaw ===
const leftJoystick = nipplejs.create({
  zone: document.getElementById('left-joystick'),
  mode: 'static',
  position: { left: '75px', bottom: '75px' },
  color: 'white'
});

leftJoystick.on('move', (evt, data) => {
  if (data.vector) {
    angularTarget.y = -data.vector.x * 0.03; // yaw
    angularTarget.x = data.vector.y * 0.03; // pitch
  }
});
leftJoystick.on('end', () => {
  angularTarget.set(0, 0, 0);
});

// === RIGHT JOYSTICK → thrust + roll ===
const rightJoystick = nipplejs.create({
  zone: document.getElementById('right-joystick'),
  mode: 'static',
  position: { right: '75px', bottom: '75px' },
  color: 'white'
});

rightJoystick.on('move', (evt, data) => {
  if (data.vector) {
    thrustTarget = data.vector.y;             // thrust (hold = accel)
    angularTarget.z = -data.vector.x * 0.03;   // roll
  }
});
rightJoystick.on('end', () => {
  thrustTarget = 0;
  angularTarget.z = 0;
});

// === ANIMATION LOOP ===
function animate() {
  requestAnimationFrame(animate);

  // Smooth angular inertia
  angularVelocity.lerp(angularTarget, angularAccel);
  angularVelocity.multiplyScalar(angularDamping);

  // Apply local rotation using quaternion
  const q = new THREE.Quaternion();
  q.setFromEuler(new THREE.Euler(
    angularVelocity.x,
    angularVelocity.y,
    angularVelocity.z,
    'XYZ'
  ));
  camera.quaternion.multiply(q);

  // Apply thrust as acceleration
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  velocity.addScaledVector(forward, thrustTarget * thrustAccel);

  // Apply damping
  velocity.multiplyScalar(linearDamping);

  // Update position
  camera.position.add(velocity);

  renderer.render(scene, camera);
}
animate();
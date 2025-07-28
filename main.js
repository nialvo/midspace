const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 10000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0);
scene.add(light);

// Load textures
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
const planetNames = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const dist = 150 + i * 50;
  const geometry = new THREE.SphereGeometry(2, 16, 16);
  const material = new THREE.MeshBasicMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(dist * Math.cos(angle), 0, dist * Math.sin(angle));
  planet.userData = { name: planetNames[i] };
  planets.push(planet);
  scene.add(planet);
}

// Markers
const markerGroup = new THREE.Group();
scene.add(markerGroup);

function updateMarkers() {
  markerGroup.clear();

  planets.forEach(planet => {
    const pos = planet.position.clone();
    const screenPos = pos.project(camera);

    if (screenPos.z < 1 && screenPos.z > -1) {
      const x = (screenPos.x + 1) / 2 * window.innerWidth;
      const y = (-screenPos.y + 1) / 2 * window.innerHeight;

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = `${x - 20}px`;
      div.style.top = `${y - 20}px`;
      div.style.color = 'white';
      div.style.fontSize = '12px';
      div.innerHTML = `🎯 ${planet.userData.name}`;
      document.body.appendChild(div);

      markerGroup.add({ dom: div });
    } else {
      const arrow = document.createElement('div');
      arrow.style.position = 'absolute';
      arrow.style.left = `${Math.max(0, Math.min(window.innerWidth - 30, (screenPos.x + 1) / 2 * window.innerWidth))}px`;
      arrow.style.top = `${Math.max(0, Math.min(window.innerHeight - 30, (-screenPos.y + 1) / 2 * window.innerHeight))}px`;
      arrow.style.color = 'red';
      arrow.style.fontSize = '14px';
      arrow.innerHTML = '➤';
      document.body.appendChild(arrow);

      markerGroup.add({ dom: arrow });
    }
  });
}

// Joystick
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

const joystick = nipplejs.create({
  zone: document.getElementById('joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: 'white'
});

joystick.on('move', (evt, data) => {
  if (data && data.vector) {
    direction.set(data.vector.x, 0, -data.vector.y).normalize();
    velocity.setLength(data.distance / 20);
  }
});

joystick.on('end', () => {
  velocity.set(0, 0, 0);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  camera.position.addScaledVector(direction, velocity.length());
  camera.lookAt(sun.position);

  updateMarkers();

  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
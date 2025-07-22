const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Assets
const rocket = new Image();
rocket.src = 'assets/rocket.png';

const planet = new Image();
planet.src = 'assets/planet.png';

// World state
let rocketPos = { x: 0, y: 0, z: 200 }; // z is distance from planet center
let angle = 0; // rotation around planet

// Input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Main loop
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === Update ===
  if (keys["ArrowLeft"]) angle -= 0.02;
  if (keys["ArrowRight"]) angle += 0.02;
  if (keys["ArrowUp"]) rocketPos.z -= 2;
  if (keys["ArrowDown"]) rocketPos.z += 2;

  // Clamp zoom
  rocketPos.z = Math.max(80, Math.min(600, rocketPos.z));

  // === Draw Planet ===
  const screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };
  const planetRadius = Math.min(canvas.width, canvas.height) / 3;

  const scale = planetRadius / rocketPos.z; // zoom effect
  const visibleRadius = planet.width * scale;

  ctx.save();
  ctx.translate(screenCenter.x, screenCenter.y);
  ctx.drawImage(
    planet,
    -visibleRadius / 2,
    -visibleRadius / 2,
    visibleRadius,
    visibleRadius
  );
  ctx.restore();

  // === Draw Rocket ===
  const orbitRadius = visibleRadius / 2 + 30;
  const rocketX = screenCenter.x + Math.cos(angle) * orbitRadius;
  const rocketY = screenCenter.y + Math.sin(angle) * orbitRadius;

  ctx.save();
  ctx.translate(rocketX, rocketY);
  ctx.rotate(angle + Math.PI / 2);
  ctx.drawImage(rocket, -16, -16, 32, 32);
  ctx.restore();

  requestAnimationFrame(loop);
}

rocket.onload = () => planet.onload = () => loop();
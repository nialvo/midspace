const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rocket = new Image();
rocket.src = 'assets/rocket.png';

const planet = new Image();
planet.src = 'assets/planet.png';

let rocketPos = { x: 0, y: 0, z: 300 };
let angle = 0;

let controls = { left: false, right: false, zoomIn: false, zoomOut: false };

document.getElementById("left").ontouchstart = () => controls.left = true;
document.getElementById("left").ontouchend = () => controls.left = false;

document.getElementById("right").ontouchstart = () => controls.right = true;
document.getElementById("right").ontouchend = () => controls.right = false;

document.getElementById("zoomIn").ontouchstart = () => controls.zoomIn = true;
document.getElementById("zoomIn").ontouchend = () => controls.zoomIn = false;

document.getElementById("zoomOut").ontouchstart = () => controls.zoomOut = true;
document.getElementById("zoomOut").ontouchend = () => controls.zoomOut = false;

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update from controls
  if (controls.left) angle -= 0.02;
  if (controls.right) angle += 0.02;
  if (controls.zoomIn) rocketPos.z -= 2;
  if (controls.zoomOut) rocketPos.z += 2;
  rocketPos.z = Math.max(80, Math.min(600, rocketPos.z));

  // Smaller planet (scales down 2x)
  const screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };
  const baseRadius = Math.min(canvas.width, canvas.height) / 4;
  const scale = baseRadius / rocketPos.z;
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
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rocket = new Image();
rocket.src = 'assets/rocket.png';

const planet = new Image();
planet.src = 'assets/planet.png';

let rocketState = {
  pos: { x: 200, y: 0, z: 300 },
  vel: { x: 0, y: 0, z: 0 },
  angle: 0,
  targetAngle: 0
};

let joystick = { x: 0, y: 0 };
let thrust = 0;

document.getElementById("thrust").addEventListener("input", (e) => {
  thrust = parseFloat(e.target.value);
});

let joyCenter = { x: 0, y: 0 };
let touching = false;

const joystickEl = document.getElementById("joystick");
joystickEl.addEventListener("touchstart", (e) => {
  touching = true;
  joyCenter = getTouchPos(e);
});
joystickEl.addEventListener("touchmove", (e) => {
  if (touching) {
    const pos = getTouchPos(e);
    joystick.x = (pos.x - joyCenter.x) / 40;
    joystick.y = (pos.y - joyCenter.y) / 40;
  }
});
joystickEl.addEventListener("touchend", () => {
  touching = false;
  joystick.x = 0;
  joystick.y = 0;
});

function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === Movement Logic ===
  let mag = Math.hypot(joystick.x, joystick.y);
  if (mag > 1) mag = 1;

  let dir = Math.atan2(joystick.y, joystick.x);
  rocketState.targetAngle = dir;

  // Smooth rotate toward target
  let da = rocketState.targetAngle - rocketState.angle;
  if (da > Math.PI) da -= 2 * Math.PI;
  if (da < -Math.PI) da += 2 * Math.PI;
  rocketState.angle += da * 0.1;

  // Apply thrust
  rocketState.vel.x += Math.cos(rocketState.angle) * thrust * 0.5;
  rocketState.vel.y += Math.sin(rocketState.angle) * thrust * 0.5;
  rocketState.pos.x += rocketState.vel.x;
  rocketState.pos.y += rocketState.vel.y;

  // === Rendering ===
  const screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };

  // Planet zoom logic
  const distance = Math.hypot(rocketState.pos.x, rocketState.pos.y);
  const scale = 200 / Math.max(distance, 100); // perspective zoom
  const planetSize = 300 * scale;

  ctx.save();
  ctx.translate(screenCenter.x, screenCenter.y);
  ctx.drawImage(planet, -planetSize / 2, -planetSize / 2, planetSize, planetSize);
  ctx.restore();

  // Draw rocket
  ctx.save();
  ctx.translate(
    screenCenter.x + rocketState.pos.x * scale,
    screenCenter.y + rocketState.pos.y * scale
  );
  ctx.rotate(rocketState.angle + Math.PI / 2);
  ctx.drawImage(rocket, -16, -16, 32, 32);
  ctx.restore();

  requestAnimationFrame(loop);
}

rocket.onload = () => planet.onload = () => loop();
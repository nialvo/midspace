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
  angle: 0
};

let joystick = { angle: 0, power: 0 }; // power = thrust
let altitudeInput = 0;

document.getElementById("altitude").addEventListener("input", (e) => {
  altitudeInput = parseFloat(e.target.value);
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
    const dx = pos.x - joyCenter.x;
    const dy = pos.y - joyCenter.y;
    joystick.angle = Math.atan2(dy, dx);
    joystick.power = Math.min(1, Math.hypot(dx, dy) / 50); // 0–1 range
  }
});
joystickEl.addEventListener("touchend", () => {
  touching = false;
  joystick.power = 0;
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

  // === Movement & Physics ===
  // Smooth rotate towards joystick angle
  let da = joystick.angle - rocketState.angle;
  if (da > Math.PI) da -= 2 * Math.PI;
  if (da < -Math.PI) da += 2 * Math.PI;
  rocketState.angle += da * 0.1;

  // Apply thrust (from joystick power)
  rocketState.vel.x += Math.cos(rocketState.angle) * joystick.power * 0.2;
  rocketState.vel.y += Math.sin(rocketState.angle) * joystick.power * 0.2;

  // Apply drag (space "friction" for control)
  rocketState.vel.x *= 0.99;
  rocketState.vel.y *= 0.99;

  // Update position
  rocketState.pos.x += rocketState.vel.x;
  rocketState.pos.y += rocketState.vel.y;

  // Altitude change proportional to speed
  const speed = Math.hypot(rocketState.vel.x, rocketState.vel.y);
  rocketState.pos.z += altitudeInput * speed * 0.5;
  rocketState.pos.z = Math.max(80, Math.min(600, rocketState.pos.z));

  // === Rendering ===
  const screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };

  // Planet zoom logic
  const distance = Math.hypot(rocketState.pos.x, rocketState.pos.y);
  const scale = 200 / Math.max(distance, 100);
  const planetSize = 200 * scale; // smaller planet

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
const canvas = document.getElementById('fireworks-canvas');
if (!canvas) {
  console.error('canvas not found');
}
const ctx = canvas.getContext('2d');

/* =====================
   画布自适应
===================== */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

/* =====================
   烟花主体
===================== */
class Firework {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height;
    this.ty = canvas.height * (0.35 + Math.random() * 0.25);
    this.v = 6 + Math.random() * 3;
    this.exploded = false;
    this.ps = [];
    this.h = Math.random() * 360;
    this.ring = Math.random() < 0.4; // 环形烟花概率
  }

  update() {
    if (!this.exploded) {
      this.y -= this.v;
      if (this.y <= this.ty) this.explode();
    } else {
      this.ps.forEach(p => p.update());
    }
  }

  draw() {
    if (!this.exploded) {
      ctx.fillStyle = `hsl(${this.h},100%,65%)`;
      ctx.fillRect(this.x, this.y, 2, 10);
    } else {
      this.ps.forEach(p => p.draw());
    }
  }

  explode() {
    this.exploded = true;
    const count = 90 + Math.random() * 120;

    for (let i = 0; i < count; i++) {
      this.ps.push(
        new Particle(this.x, this.y, this.h, this.ring)
      );
    }
  }
}

/* =====================
   粒子（重点优化）
===================== */
class Particle {
  constructor(x, y, h, ring) {
    const angle = ring
      ? (Math.PI * 2 / 120) * Math.floor(Math.random() * 120)
      : Math.random() * Math.PI * 2;

    const speed = ring
      ? 4 + Math.random() * 1.5
      : Math.random() * 6 + 1;

    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.a = 1;
    this.h = h;

    this.friction = 0.98;
    this.gravity = 0.06;
    this.fade = 0.01 + Math.random() * 0.02;
    this.size = 2 + Math.random() * 2;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;
    this.a -= this.fade;
  }

  draw() {
    if (this.a <= 0) return;

    const g = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2
    );
    g.addColorStop(0, `hsla(${this.h},100%,70%,${this.a})`);
    g.addColorStop(1, `hsla(${this.h},100%,40%,0)`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* =====================
   主循环（性能安全）
===================== */
const list = [];

(function loop() {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.035) {
    list.push(new Firework());
  }

  for (let i = list.length - 1; i >= 0; i--) {
    const f = list[i];
    f.update();
    f.draw();

    if (f.exploded && f.ps.every(p => p.a <= 0)) {
      list.splice(i, 1);
    }
  }

  requestAnimationFrame(loop);
})();

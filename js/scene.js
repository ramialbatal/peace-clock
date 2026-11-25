// @ts-check
/**
 * Peace Clock: the picture behind the top of the page. A city at night under sweeping searchlights, with drones
 * blinking overhead, smoke rising from damaged buildings, a warm dawn glow on the horizon, and now and then a white
 * dove crossing the sky. Drawn with a 2D canvas; clock-core's startScene runs it (see app.js).
 */
import { seeded } from "clock-core";

/** @typedef {[number, number, number]} RGB */
/** @param {RGB} c @param {number} [a] */
const rgba = (c, a = 1) => `rgba(${c.join(",")},${a})`;

const SKY = /** @type {RGB[]} */ ([[7, 9, 18], [24, 28, 50], [120, 78, 74]]);
const CITY = /** @type {RGB} */ ([11, 12, 19]), FAR = /** @type {RGB} */ ([28, 31, 50]);

// The dove (the same drawing as the homepage card), in a 50 by 32 box facing right
const DOVE = {
  far: new Path2D("M19 17 C20 9 25 3.5 31 1 C30.5 6.5 28 12 24.5 17 Z"),
  body: new Path2D("M1.5 21.5 C7 18.5 13 17 20 17.2 C25.5 17.4 29 16 31.6 13.4 C33.2 11.8 35.6 11.8 36.6 13.4 L40.2 14.6 L36.4 15.8 C34.6 20.2 29.4 23.4 22 24.2 C15 25 9 24 4.6 22.8 L0 25.6 Z"),
  near: new Path2D("M12.6 20.6 C11.8 11 7.5 5.2 1.8 1.6 C9.6 2 16.6 6.4 20.4 12.4 C21.8 14.6 22.6 17.4 22.8 20.6 Z"),
  twig: new Path2D("M39.6 15 C42 16 44 17.6 45.6 19.6"),
  leaves: new Path2D("M40.6 16.4 a1.8 .75 -25 1 0 3.2 -1.6 a1.8 .75 -25 1 0 -3.2 1.6 Z M42.9 19 a1.8 .75 35 1 0 3 1.6 a1.8 .75 35 1 0 -3 -1.6 Z M41.2 17.2 a1.6 .7 60 1 0 1.4 2.8 a1.6 .7 60 1 0 -1.4 -2.8 Z"),
};

/** A soft round sprite for smoke and glows. */
function softDot() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(150,150,160,1)"); r.addColorStop(0.55, "rgba(150,150,160,.4)"); r.addColorStop(1, "rgba(150,150,160,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return c;
}

/**
 * Build the peace scene.
 * @returns {import("clock-core").Scene}
 */
export function peaceScene() {
  const dot = softDot();
  /** @type {{ x: number, w: number, h: number, near: boolean, broken: number[] | null, windows: { x: number, y: number, on: boolean }[] }[]} */
  let buildings = [];
  /** @type {{ x: number, y: number, r: number, p: number }[]} */ let stars = [];
  /** @type {{ x: number, speed: number, phase: number }[]} */ let lights = [];
  /** @type {{ x: number, y: number, speed: number, size: number, phase: number }[]} */ let drones = [];
  /** @type {{ x: number, top: number }[]} */ let fires = [];
  /** @type {{ x: number, y: number, vy: number, r: number, age: number, life: number }[]} */ let smoke = [];
  let maxH = 0;

  return {
    layout(f) {
      const { w, ground: G } = f;
      const rnd = seeded(9);
      maxH = G * (w < 600 ? 0.3 : 0.4);
      stars = Array.from({ length: Math.round(w / 9) }, () => ({ x: rnd() * w, y: rnd() * G * 0.6, r: rnd() < 0.15 ? 1.4 : 0.8, p: rnd() * 6 }));
      buildings = [];
      for (const near of [false, true]) {
        for (let x = near ? -10 : -30; x < w + 20;) {
          const bw = (near ? 30 : 24) + rnd() * (near ? 56 : 40);
          const bh = maxH * (near ? 0.3 + rnd() * 0.55 : 0.45 + rnd() * 0.5);
          // Some near buildings are damaged: a jagged, broken top
          const broken = near && rnd() < 0.3 ? Array.from({ length: 5 }, () => rnd()) : null;
          const windows = [];
          if (near) {
            for (let wy = G - bh + 8; wy < G - 6; wy += 9) for (let wx = x + 5; wx < x + bw - 5; wx += 7) {
              if (rnd() < 0.08) windows.push({ x: wx, y: wy, on: true });   // a city in blackout: few lights
            }
          }
          buildings.push({ x, w: bw, h: bh, near, broken, windows });
          x += bw + (near ? 2 + rnd() * 8 : -4);
        }
      }
      fires = buildings.filter((b) => b.broken).slice(0, 3).map((b) => ({ x: b.x + b.w * 0.5, top: G - b.h * 0.7 }));
      lights = [0.18, 0.55, 0.86].map((p, i) => ({ x: w * p, speed: 0.12 + i * 0.03, phase: i * 1.7 }));
      drones = Array.from({ length: w < 600 ? 3 : 5 }, (_, i) => ({
        x: rnd() * w, y: G * (0.32 + rnd() * 0.3), speed: (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 10), size: 5 + rnd() * 3, phase: rnd() * 6 + i,
      }));
      smoke = [];
      for (let i = 0; i < 80; i++) stepSmoke(0.1);
    },

    draw(f) {
      const { ctx, w, h, ground: G, t, dt } = f;

      // Night sky with a warm dawn glow at the horizon
      const sky = ctx.createLinearGradient(0, 0, 0, G);
      sky.addColorStop(0, rgba(SKY[0])); sky.addColorStop(0.62, rgba(SKY[1])); sky.addColorStop(1, rgba(SKY[2]));
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, G + 1);
      const dawn = ctx.createRadialGradient(w * 0.5, G + 40, 10, w * 0.5, G + 40, Math.max(w * 0.55, 260));
      dawn.addColorStop(0, `rgba(255,190,140,${0.32 + 0.06 * Math.sin(t * 0.2)})`); dawn.addColorStop(1, "rgba(255,170,120,0)");
      ctx.fillStyle = dawn; ctx.fillRect(0, 0, w, G + 1);

      // Stars, twinkling
      for (const s of stars) {
        ctx.fillStyle = `rgba(230,235,255,${0.35 + 0.3 * Math.sin(t * 1.5 + s.p)})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }

      // Searchlights sweeping the sky
      for (const l of lights) {
        const a = -Math.PI / 2 + Math.sin(t * l.speed + l.phase) * 0.55, len = G * 1.1, spread = 0.07;
        const beam = ctx.createLinearGradient(l.x, G, l.x + Math.cos(a) * len, G + Math.sin(a) * len);
        beam.addColorStop(0, "rgba(220,230,255,.16)"); beam.addColorStop(1, "rgba(220,230,255,0)");
        ctx.fillStyle = beam;
        ctx.beginPath(); ctx.moveTo(l.x, G);
        ctx.lineTo(l.x + Math.cos(a - spread) * len, G + Math.sin(a - spread) * len);
        ctx.lineTo(l.x + Math.cos(a + spread) * len, G + Math.sin(a + spread) * len);
        ctx.fill();
      }

      // Drones crossing slowly, red lights blinking
      for (const d of drones) {
        if (dt) { d.x += d.speed * dt; if (d.x > w + 30) d.x = -30; if (d.x < -30) d.x = w + 30; }
        const y = d.y + Math.sin(t * 0.9 + d.phase) * 4, s = d.size;
        ctx.strokeStyle = "rgba(10,12,20,.95)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(d.x - s, y - s * 0.5); ctx.lineTo(d.x + s, y + s * 0.5); ctx.moveTo(d.x + s, y - s * 0.5); ctx.lineTo(d.x - s, y + s * 0.5); ctx.stroke();
        ctx.fillStyle = "rgba(10,12,20,.95)"; ctx.fillRect(d.x - s * 0.35, y - s * 0.25, s * 0.7, s * 0.5);
        if (Math.sin(t * 3 + d.phase) > 0.2) { ctx.fillStyle = "rgba(255,60,60,.95)"; ctx.fillRect(d.x - 1, y + s * 0.3, 2, 2); }
      }

      // Smoke rising from damaged buildings
      if (dt) stepSmoke(dt);
      for (const p of smoke) {
        const life = p.age / p.life;
        ctx.globalAlpha = Math.min(1, life * 10) * (1 - life) * 0.4;
        ctx.drawImage(dot, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;

      // The city: far towers, then near buildings (some broken), a few lit windows
      for (const b of buildings) {
        ctx.fillStyle = rgba(b.near ? CITY : FAR);
        if (b.broken) {
          const top = G - b.h;
          ctx.beginPath(); ctx.moveTo(b.x, G); ctx.lineTo(b.x, top + b.broken[0] * b.h * 0.25);
          for (let i = 1; i < 5; i++) ctx.lineTo(b.x + (b.w * i) / 5, top + b.broken[i] * b.h * 0.45);
          ctx.lineTo(b.x + b.w, top + b.broken[4] * b.h * 0.3); ctx.lineTo(b.x + b.w, G); ctx.fill();
        } else {
          ctx.fillRect(b.x, G - b.h, b.w, b.h + 1);
        }
        ctx.fillStyle = "rgba(255,196,120,.8)";
        for (const wd of b.windows) if (!b.broken || wd.y > G - b.h * 0.5) ctx.fillRect(wd.x, wd.y, 2.5, 3.5);
      }
      // A faint glow of fire inside the damaged buildings
      for (const fi of fires) {
        const g = ctx.createRadialGradient(fi.x, fi.top + 8, 0, fi.x, fi.top + 8, 22);
        g.addColorStop(0, `rgba(255,130,60,${0.35 + 0.15 * Math.sin(t * 7 + fi.x)})`); g.addColorStop(1, "rgba(255,110,50,0)");
        ctx.fillStyle = g; ctx.fillRect(fi.x - 22, fi.top - 14, 44, 44);
      }

      // Now and then, a white dove with an olive twig flies across: a sign of hope
      const cycle = 26, k = ((t + 8) % cycle) / 11;
      if (k < 1) {
        const s = w < 600 ? 0.9 : 1.2, x = -60 + k * (w + 120), y = G * 0.52 + Math.sin(k * Math.PI * 2) * G * 0.04;   // below the header text, above the rooftops
        const flap = 0.7 + 0.3 * Math.cos(t * 6);   // wings beat between fully raised (1) and half raised
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-22, -16);
        // The far wing, then the body, then the near wing; both wings fold towards the body as they flap
        ctx.save(); ctx.translate(0, 17); ctx.scale(1, flap); ctx.translate(0, -17);
        ctx.fillStyle = "rgba(201,207,221,.95)"; ctx.fill(DOVE.far); ctx.restore();
        ctx.fillStyle = "rgba(247,248,252,.97)"; ctx.fill(DOVE.body);
        ctx.save(); ctx.translate(0, 20); ctx.scale(1, flap); ctx.translate(0, -20); ctx.fill(DOVE.near); ctx.restore();
        ctx.fillStyle = "#1b2040"; ctx.beginPath(); ctx.arc(34.6, 13.6, 0.75, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#86c07a"; ctx.lineWidth = 1; ctx.lineCap = "round"; ctx.stroke(DOVE.twig);
        ctx.fillStyle = "#86c07a"; ctx.fill(DOVE.leaves);
        ctx.restore();
      }

      // Dark ground below the horizon, fading into the page
      const ground = ctx.createLinearGradient(0, G, 0, h);
      ground.addColorStop(0, "rgb(20,20,30)"); ground.addColorStop(0.3, "rgb(12,12,18)"); ground.addColorStop(1, "rgb(9,10,14)");
      ctx.fillStyle = ground; ctx.fillRect(0, G, w, h - G);
    },
  };

  /** Move the smoke on by dt seconds, adding puffs above each fire. @param {number} dt */
  function stepSmoke(dt) {
    for (const fi of fires) {
      if (Math.random() < 3 * dt) smoke.push({ x: fi.x + (Math.random() - 0.5) * 8, y: fi.top, vy: -(10 + Math.random() * 8), r: 6, age: 0, life: 6 + Math.random() * 3 });
    }
    for (const p of smoke) { p.age += dt; p.y += p.vy * dt; p.x += 6 * dt; p.r += 5 * dt; }
    smoke = smoke.filter((p) => p.age < p.life);
  }
}

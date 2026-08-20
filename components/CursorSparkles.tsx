"use client";

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  spin: number;
  star: boolean;
  hue: number;
};

const MAX = 260;

/** Pre-render one 4-point star and one soft dot so the loop only blits. */
function makeSprites() {
  const S = 64;

  const star = document.createElement("canvas");
  star.width = star.height = S;
  const sc = star.getContext("2d")!;
  const g = sc.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,236,208,0.75)");
  g.addColorStop(1, "rgba(255,236,208,0)");
  sc.fillStyle = g;
  sc.beginPath();
  // four-point star via quadratic pinches
  const c = S / 2;
  const R = S / 2;
  const r = S * 0.055;
  sc.moveTo(c, c - R);
  sc.quadraticCurveTo(c + r, c - r, c + R, c);
  sc.quadraticCurveTo(c + r, c + r, c, c + R);
  sc.quadraticCurveTo(c - r, c + r, c - R, c);
  sc.quadraticCurveTo(c - r, c - r, c, c - R);
  sc.fill();

  const dot = document.createElement("canvas");
  dot.width = dot.height = S;
  const dc = dot.getContext("2d")!;
  const g2 = dc.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g2.addColorStop(0, "rgba(255,246,232,0.95)");
  g2.addColorStop(0.4, "rgba(216,180,138,0.35)");
  g2.addColorStop(1, "rgba(216,180,138,0)");
  dc.fillStyle = g2;
  dc.fillRect(0, 0, S, S);

  return { star, dot };
}

export default function CursorSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // pointer trails are meaningless without a pointer
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sprites = makeSprites();
    const sparks: Spark[] = [];

    let dpr = 1;
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let px = -1;
    let py = -1;
    let mx = 0;
    let my = 0;
    let moved = false;
    let carry = 0;

    const spawn = (x: number, y: number, speed: number) => {
      if (sparks.length >= MAX) return;
      const angle = Math.random() * Math.PI * 2;
      // faster cursor throws sparks wider
      const spread = 0.18 + Math.min(speed, 40) * 0.022;
      const star = Math.random() < 0.42;
      sparks.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * spread,
        vy: Math.sin(angle) * spread - 0.06,
        life: 0,
        maxLife: 900 + Math.random() * 1400,
        size: star ? 7 + Math.random() * 13 : 3 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.0012,
        star,
        hue: Math.random(),
      });
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      moved = true;
    };

    let raf = 0;
    let last = performance.now();
    let running = true;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 48);
      last = now;
      if (!running) return;

      if (moved) {
        if (px < 0) {
          px = mx;
          py = my;
        }
        const dx = mx - px;
        const dy = my - py;
        const dist = Math.hypot(dx, dy);

        // emit along the path so fast movement leaves a continuous stream
        carry += dist;
        const step = 9;
        let travelled = 0;
        while (carry >= step && travelled < dist + step) {
          carry -= step;
          travelled += step;
          const t = dist === 0 ? 0 : travelled / dist;
          spawn(px + dx * t, py + dy * t, dist);
        }

        px = mx;
        py = my;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        const p = s.life / s.maxLife;

        // drift: slight upward float with a lateral sway, air-resistance damped
        s.vy += -0.000018 * dt;
        s.vx += Math.sin(s.life * 0.0016 + s.hue * 9) * 0.0009;
        s.vx *= 0.995;
        s.vy *= 0.995;
        s.x += s.vx * dt * 0.06;
        s.y += s.vy * dt * 0.06;
        s.rot += s.spin * dt;

        // quick bloom, long tail-off, plus a twinkle flicker
        const env = p < 0.12 ? p / 0.12 : Math.pow(1 - (p - 0.12) / 0.88, 1.7);
        const flicker = 0.62 + 0.38 * Math.sin(s.life * 0.011 + s.hue * 21);
        const alpha = env * flicker * (s.star ? 0.85 : 0.55);
        if (alpha <= 0.004) continue;

        const size = s.size * (0.7 + env * 0.5);
        ctx.globalAlpha = alpha;

        if (s.star) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);
          ctx.drawImage(sprites.star, -size / 2, -size / 2, size, size);
          ctx.restore();
        } else {
          ctx.drawImage(sprites.dot, s.x - size / 2, s.y - size / 2, size, size);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const onVis = () => {
      running = !document.hidden;
      last = performance.now();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
      }}
    />
  );
}

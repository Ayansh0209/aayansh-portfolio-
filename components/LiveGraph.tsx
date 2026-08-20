"use client";

import { useEffect, useRef } from "react";

/**
 * A live 3D dependency graph — the thing CodeMap AI actually produces.
 * A hub file in the middle, the files that import it on one side, the files
 * it imports on the other, rotating in real 3D with pulses travelling the
 * edges. Canvas 2D with a hand-rolled perspective projection, so it costs
 * almost nothing next to the two WebGL canvases already on the page.
 */

type Node = {
  x: number;
  y: number;
  z: number;
  label: string;
  side: -1 | 0 | 1; // -1 imported-by · 0 hub · 1 imports
  r: number;
};

const IMPORTED_BY = ["login.ts", "api.ts", "session.ts", "routes.ts"];
const IMPORTS = ["jwt.ts", "db.ts", "crypto.ts", "redis.ts"];

function buildNodes(): Node[] {
  const nodes: Node[] = [
    { x: 0, y: 0, z: 0, label: "auth.ts", side: 0, r: 5.5 },
  ];

  IMPORTED_BY.forEach((label, i) => {
    const t = (i / (IMPORTED_BY.length - 1)) * 2 - 1;
    nodes.push({
      x: -1.05,
      y: t * 0.8,
      z: Math.sin(i * 1.9) * 0.28,
      label,
      side: -1,
      r: 3.2,
    });
  });

  IMPORTS.forEach((label, i) => {
    const t = (i / (IMPORTS.length - 1)) * 2 - 1;
    nodes.push({
      x: 1.05,
      y: t * 0.8,
      z: Math.cos(i * 2.3) * 0.28,
      label,
      side: 1,
      r: 3.2,
    });
  });

  return nodes;
}

/** faint background files, no labels — the rest of the repo */
function buildDust(n: number) {
  const out: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: (Math.random() - 0.5) * 3.4,
      y: (Math.random() - 0.5) * 1.9,
      z: (Math.random() - 0.5) * 2.4,
    });
  }
  return out;
}

export default function LiveGraph({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = buildNodes();
    const dust = buildDust(46);
    const pointer = { x: 0, y: 0 };

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - (r.left + r.width / 2)) / r.width) * 2;
      pointer.y = ((e.clientY - (r.top + r.height / 2)) / r.height) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let angle = 0;
    let tilt = 0;
    let last = performance.now();

    const FOCAL = 3.4;

    const project = (x: number, y: number, z: number, a: number, t: number) => {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const x1 = x * ca + z * sa;
      const z1 = -x * sa + z * ca;

      const ct = Math.cos(t);
      const st = Math.sin(t);
      const y1 = y * ct - z1 * st;
      const z2 = y * st + z1 * ct;

      const scale = FOCAL / (FOCAL + z2);
      // pull the columns in a little on narrow canvases so the labels,
      // which sit outside the nodes, still have room
      const S = Math.min(w, h * 1.9) * (w < 420 ? 0.235 : 0.29);
      return {
        sx: w / 2 + x1 * scale * S,
        sy: h / 2 + y1 * scale * S,
        depth: z2,
        scale,
      };
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(now - last, 50);
      last = now;
      if (!activeRef.current || !w || !h) return;

      if (!reduced) angle += dt * 0.00019;
      tilt += (pointer.y * 0.32 - tilt) * 0.05;
      const a = angle + pointer.x * 0.22;

      ctx.clearRect(0, 0, w, h);

      // ── background files ────────────────────────────────
      for (const d of dust) {
        const p = project(d.x, d.y, d.z, a * 0.75, tilt * 0.6);
        const fade = Math.max(0, Math.min(1, (p.depth + 2.2) / 3.4));
        ctx.fillStyle = `rgba(216,180,138,${0.05 + fade * 0.13})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 0.9 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      const pts = nodes.map((n) => ({ n, p: project(n.x, n.y, n.z, a, tilt) }));
      const hub = pts[0];

      // ── edges, with a pulse running hub-ward or out ─────
      pts.slice(1).forEach((item, i) => {
        const from = item.n.side === -1 ? item.p : hub.p;
        const to = item.n.side === -1 ? hub.p : item.p;
        const depthFade = Math.max(
          0.16,
          Math.min(1, (item.p.depth + 1.8) / 3.2)
        );

        // right-angle connector, the way the product draws them
        const midX = (from.sx + to.sx) / 2;
        ctx.strokeStyle = `rgba(216,180,138,${0.1 + depthFade * 0.17})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(from.sx, from.sy);
        ctx.lineTo(midX, from.sy);
        ctx.lineTo(midX, to.sy);
        ctx.lineTo(to.sx, to.sy);
        ctx.stroke();

        if (reduced) return;

        // travelling pulse
        const t = ((now * 0.00022 + i * 0.17) % 1);
        const seg = t < 0.34 ? 0 : t < 0.66 ? 1 : 2;
        const local = (t - seg * 0.333) / 0.333;
        let px: number;
        let py: number;
        if (seg === 0) {
          px = from.sx + (midX - from.sx) * local;
          py = from.sy;
        } else if (seg === 1) {
          px = midX;
          py = from.sy + (to.sy - from.sy) * local;
        } else {
          px = midX + (to.sx - midX) * local;
          py = to.sy;
        }
        ctx.fillStyle = `rgba(255,240,214,${0.75 * depthFade})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── nodes back to front ─────────────────────────────
      const sorted = [...pts].sort((p, q) => q.p.depth - p.p.depth);
      for (const { n, p } of sorted) {
        const depthFade = Math.max(0.22, Math.min(1, (p.depth + 1.8) / 3.2));
        const r = n.r * p.scale;

        if (n.side === 0) {
          const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 4.4);
          glow.addColorStop(0, "rgba(216,180,138,0.42)");
          glow.addColorStop(1, "rgba(216,180,138,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 4.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle =
          n.side === 0
            ? `rgba(240,203,160,${0.95 * depthFade})`
            : `rgba(226,209,184,${0.7 * depthFade})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();

        if (n.side === 0) {
          ctx.strokeStyle = `rgba(255,240,214,${0.8 * depthFade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // label only the nodes facing the camera — as the graph turns, the
        // ones behind drop their labels instead of stacking on top of others
        const facing = n.side === 0 || p.depth < 0.2;
        if (!facing) continue;

        const fs = Math.max(7, (w < 420 ? 8.4 : 9.5) * p.scale);
        ctx.font = `${fs}px ui-monospace, "JetBrains Mono", monospace`;
        ctx.textBaseline = "middle";
        ctx.fillStyle =
          n.side === 0
            ? `rgba(255,240,214,${0.95 * depthFade})`
            : `rgba(226,209,184,${0.62 * depthFade})`;
        if (n.side === 1) {
          ctx.textAlign = "left";
          ctx.fillText(n.label, p.sx + r + 6, p.sy);
        } else if (n.side === -1) {
          ctx.textAlign = "right";
          ctx.fillText(n.label, p.sx - r - 6, p.sy);
        } else {
          ctx.textAlign = "center";
          ctx.fillText(n.label, p.sx, p.sy + r + 11);
        }
      }

      // ── column captions ─────────────────────────────────
      // below this width they would collide with the node labels
      if (w >= 360) {
        ctx.font = '8px ui-monospace, "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(138,133,125,0.85)";
        ctx.fillText("IMPORTED BY", 14, 12);
        ctx.textAlign = "right";
        ctx.fillText("IMPORTS", w - 14, 12);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="block h-full w-full" aria-hidden />;
}

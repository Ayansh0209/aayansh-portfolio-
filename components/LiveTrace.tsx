"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A live bubble-sort trace — the thing Interactive Algorithm Tutor does.
 * The steps below are a real trace of the algorithm on [5,2,9,1,6],
 * generated the same way the product would: run it, record every compare
 * and swap. Bars are drawn as extruded 3D boxes that lean with the pointer.
 */

type Step = {
  arr: number[];
  i: number;
  j: number;
  line: number;
  swapped: boolean;
  note: string;
};

const CODE = [
  "arr = [5, 2, 9, 1, 6]",
  "n = len(arr)",
  "for i in range(n):",
  "  for j in range(n - i - 1):",
  "    if arr[j] > arr[j + 1]:",
  "      arr[j], arr[j+1] = arr[j+1], arr[j]",
];

function trace(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [
    { arr: [...arr], i: -1, j: -1, line: 0, swapped: false, note: "load the array" },
  ];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        arr: [...arr],
        i,
        j,
        line: 4,
        swapped: false,
        note: `${arr[j]} vs ${arr[j + 1]}`,
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          arr: [...arr],
          i,
          j,
          line: 5,
          swapped: true,
          note: `${arr[j + 1]} > ${arr[j]} — swap them`,
        });
      }
    }
  }
  steps.push({
    arr: [...arr],
    i: -1,
    j: -1,
    line: 2,
    swapped: false,
    note: "sorted",
  });
  return steps;
}

export default function LiveTrace({ active }: { active: boolean }) {
  const steps = useMemo(() => trace([5, 2, 9, 1, 6]), []);
  const [idx, setIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  // the draw loop reads the current step through this, so it never restarts
  const stepRef = useRef(steps[0]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    stepRef.current = steps[idx];
  }, [steps, idx]);

  /* advance the trace */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!activeRef.current) return;
      setIdx((v) => (v + 1) % steps.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [steps.length]);

  /* draw the bars */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pointer = { x: 0, y: 0 };
    let w = 0;
    let h = 0;
    let raf = 0;

    // values animate toward their target so swaps glide
    const shown = steps[0].arr.map((v) => v);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!w || !h) return;

      const step = stepRef.current;
      const target = step.arr;
      for (let k = 0; k < shown.length; k++) {
        shown[k] += (target[k] - shown[k]) * 0.18;
      }

      ctx.clearRect(0, 0, w, h);

      const padX = 16;
      const padTop = 24;
      const padBottom = 22;
      const n = shown.length;
      const gap = 9;
      const bw = (w - padX * 2 - gap * (n - 1)) / n;
      const maxV = 9;
      const usable = h - padTop - padBottom;

      // depth offset — this is what makes them read as solid boxes
      const dx = 6 + pointer.x * 3.5;
      const dy = -(5 + pointer.y * 2.4);

      ctx.font = '9px ui-monospace, "JetBrains Mono", monospace';
      ctx.textBaseline = "middle";

      for (let k = 0; k < n; k++) {
        const v = shown[k];
        const bh = Math.max(4, (v / maxV) * usable);
        const x = padX + k * (bw + gap);
        const y = h - padBottom - bh;

        const isPair = k === step.j || k === step.j + 1;
        const hot = isPair && step.j >= 0;
        const settled = step.i >= 0 && k >= n - step.i;

        const face = hot
          ? "rgba(240,203,160,0.92)"
          : settled
            ? "rgba(150,138,124,0.5)"
            : "rgba(176,128,82,0.62)";
        const top = hot
          ? "rgba(255,240,214,0.98)"
          : settled
            ? "rgba(178,166,150,0.55)"
            : "rgba(214,170,120,0.72)";
        const side = hot
          ? "rgba(176,128,82,0.85)"
          : settled
            ? "rgba(96,90,82,0.5)"
            : "rgba(112,82,52,0.7)";

        // right face
        ctx.fillStyle = side;
        ctx.beginPath();
        ctx.moveTo(x + bw, y);
        ctx.lineTo(x + bw + dx, y + dy);
        ctx.lineTo(x + bw + dx, y + bh + dy);
        ctx.lineTo(x + bw, y + bh);
        ctx.closePath();
        ctx.fill();

        // top face
        ctx.fillStyle = top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.lineTo(x + bw + dx, y + dy);
        ctx.lineTo(x + bw, y);
        ctx.closePath();
        ctx.fill();

        // front face
        ctx.fillStyle = face;
        ctx.fillRect(x, y, bw, bh);

        if (hot) {
          ctx.strokeStyle = "rgba(255,240,214,0.9)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
        }

        // value under the bar
        ctx.textAlign = "center";
        ctx.fillStyle = hot
          ? "rgba(255,240,214,0.95)"
          : "rgba(138,133,125,0.85)";
        ctx.fillText(
          String(Math.round(v)),
          x + bw / 2,
          h - padBottom + 11
        );
      }

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(138,133,125,0.8)";
      ctx.fillText("ARRAY · AUTO-DETECTED", padX, 11);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [steps]);

  const step = steps[idx];

  return (
    <div className="flex h-full w-full">
      {/* code */}
      <div
        className="flex h-full flex-col justify-center gap-[3px] py-3 pl-3 pr-2"
        style={{ width: "45%", borderRight: "1px solid var(--line)" }}
      >
        {CODE.map((line, i) => {
          const on = i === step.line;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-1.5 py-[1px]"
              style={{
                background: on ? "rgba(176,128,82,0.16)" : "transparent",
                borderLeft: `2px solid ${on ? "var(--accent-soft)" : "transparent"}`,
                transition: "background 0.25s ease",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb), monospace",
                  fontSize: "8px",
                  color: "var(--faint)",
                  minWidth: "8px",
                }}
              >
                {i + 1}
              </span>
              <span
                className="truncate"
                style={{
                  fontFamily: "var(--font-mono-jb), monospace",
                  fontSize: "9px",
                  color: on ? "var(--text)" : "var(--muted)",
                  whiteSpace: "pre",
                }}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>

      {/* visualisation */}
      <div className="relative flex h-full flex-1 flex-col">
        <canvas ref={canvasRef} className="block w-full flex-1" aria-hidden />

        <div
          className="flex items-center gap-3 px-3 py-1.5"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <span
            className="truncate"
            style={{
              fontFamily: "var(--font-mono-jb), monospace",
              fontSize: "8.5px",
              color: "var(--accent-soft)",
            }}
          >
            {step.note}
          </span>
          <span
            className="ml-auto shrink-0"
            style={{
              fontFamily: "var(--font-mono-jb), monospace",
              fontSize: "8.5px",
              color: "var(--faint)",
            }}
          >
            {String(idx + 1).padStart(2, "0")}/{steps.length}
          </span>
        </div>

        <div style={{ height: "2px", background: "rgba(232,224,214,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${((idx + 1) / steps.length) * 100}%`,
              background: "var(--accent-soft)",
              transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

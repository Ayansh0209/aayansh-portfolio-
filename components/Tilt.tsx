"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer-driven 3D tilt. The wrapper owns the perspective; the inner
 * element rotates and keeps `preserve-3d`, so children lifted with
 * translateZ get real parallax rather than a flat skew.
 *
 * Tracking is relative to the element's centre and damped on rAF, so the
 * card keeps reacting while the pointer moves anywhere over the section.
 */
export default function Tilt({
  children,
  max = 7,
  perspective = 1400,
  className,
  style,
  scope,
}: {
  children: React.ReactNode;
  max?: number;
  perspective?: number;
  className?: string;
  style?: React.CSSProperties;
  /** how far out to keep tracking, in multiples of the element size */
  scope?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current;
    const box = inner.current;
    if (!el || !box) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reach = scope ?? 1.6;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;
    let alive = true;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // normalised distance from centre, clamped to the reach
      const nx = (e.clientX - cx) / ((r.width / 2) * reach);
      const ny = (e.clientY - cy) / ((r.height / 2) * reach);
      targetY = Math.max(-1, Math.min(1, nx)) * max;
      targetX = Math.max(-1, Math.min(1, ny)) * -max;
    };

    const loop = () => {
      if (!alive) return;
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      box.style.transform = `rotateX(${curX.toFixed(3)}deg) rotateY(${curY.toFixed(
        3
      )}deg)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [max, scope]);

  return (
    <div
      ref={outer}
      className={className}
      style={{ perspective: `${perspective}px`, ...style }}
    >
      <div
        ref={inner}
        style={{
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

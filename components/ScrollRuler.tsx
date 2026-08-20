"use client";

import { useEffect, useRef, useState } from "react";



/**
 * The measuring-tape scroll indicator pinned to the bottom of the viewport.
 * A single cursor line rides the ruler; the readout mirrors vanlent's
 * live-transform-text motif but reports something real.
 */
export default function ScrollRuler() {
  const [progress, setProgress] = useState(0);
  const [offset, setOffset] = useState(0);
  const [ticks, setTicks] = useState(88);
  const frame = useRef(0);

  useEffect(() => {
    const fit = () => setTicks(Math.max(24, Math.round(window.innerWidth / 18)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const read = () => {
      frame.current = 0;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const y = window.scrollY;
      setProgress(Math.min(1, Math.max(0, y / max)));
      setOffset(Math.round(y));
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-0 left-0 z-40 w-full"
      style={{
        paddingInline: "var(--gutter)",
        paddingBottom: "18px",
        background:
          "linear-gradient(to top, rgba(7,7,8,0.92) 15%, rgba(7,7,8,0) 100%)",
      }}
    >
      <div className="mb-1.5 flex items-end justify-between">
        <span className="debug-text">
          transform: translateY(-{offset}px)
        </span>
        <span className="debug-text">
          {String(Math.round(progress * 100)).padStart(3, "0")}%
        </span>
      </div>

      <div className="relative h-[18px] w-full">
        <div className="absolute inset-x-0 top-0 flex h-[14px] w-full items-start justify-between">
          {Array.from({ length: ticks }).map((_, i) => {
            const major = i % 8 === 0;
            return (
              <span
                key={i}
                className="block w-px"
                style={{
                  height: major ? "13px" : "6px",
                  background: major
                    ? "rgba(232,224,214,0.26)"
                    : "rgba(232,224,214,0.13)",
                }}
              />
            );
          })}
        </div>

        <div
          className="absolute top-[-4px] h-[22px] w-px transition-transform duration-100 ease-out"
          style={{
            left: 0,
            transform: `translateX(calc(${progress} * (100vw - 2 * var(--gutter))))`,
            background: "var(--accent-soft)",
            boxShadow: "0 0 10px 1px rgba(216,180,138,0.55)",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "default" | "next" | "prev" | "link" | "tag" | "hidden";

/**
 * A cursor that changes shape for what it is over — a small ring by default,
 * an arrow over the carousel controls, an expanded disc with a label over
 * links. The ring trails the pointer; the dot tracks it exactly, so there is
 * a little weight to the movement.
 *
 * Pointer devices only. Touch keeps the native behaviour.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("hidden");
  const [label, setLabel] = useState("");

  // The elements always render; on a touch device the listeners simply never
  // attach, so `mode` stays "hidden" and nothing is ever painted.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const resolve = (target: EventTarget | null): { m: Mode; l: string } => {
      let node = target as HTMLElement | null;
      while (node && node !== document.body) {
        const c = node.dataset?.cursor;
        if (c === "next") return { m: "next", l: "" };
        if (c === "prev") return { m: "prev", l: "" };
        if (c === "tag") return { m: "tag", l: "" };
        if (c) return { m: "link", l: c };

        if (node.tagName === "A" || node.tagName === "BUTTON") {
          const t = node.getAttribute("aria-label") ?? "";
          if (/next/i.test(t)) return { m: "next", l: "" };
          if (/previous|prev/i.test(t)) return { m: "prev", l: "" };
          const href = node.getAttribute("href") ?? "";
          if (href.startsWith("mailto:")) return { m: "link", l: "Write" };
          if (node.getAttribute("target") === "_blank")
            return { m: "link", l: "Open" };
          return { m: "link", l: "" };
        }
        node = node.parentElement;
      }
      return { m: "default", l: "" };
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      const next = resolve(e.target);
      setMode((prev) => (prev === next.m ? prev : next.m));
      setLabel((prev) => (prev === next.l ? prev : next.l));
    };

    const onLeave = () => setMode("hidden");
    const onEnter = () => setMode("default");

    const loop = () => {
      raf = requestAnimationFrame(loop);
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(
          2
        )}px, 0) translate(-50%, -50%)`;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  const isArrow = mode === "next" || mode === "prev";
  const size = isArrow ? 58 : mode === "link" ? (label ? 74 : 52) : mode === "tag" ? 34 : 26;

  return (
    <>
      {/* the trailing ring — this is the shape that morphs */}
      <div
        ref={ring}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 90,
          pointerEvents: "none",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `1px solid ${
            isArrow || mode === "link" ? "var(--accent-soft)" : "rgba(232,224,214,0.35)"
          }`,
          background:
            isArrow || mode === "link" ? "rgba(176,128,82,0.14)" : "transparent",
          backdropFilter: mode === "link" ? "blur(1px)" : undefined,
          opacity: mode === "hidden" ? 0 : 1,
          display: "grid",
          placeItems: "center",
          transition:
            "width .4s cubic-bezier(.16,1,.3,1), height .4s cubic-bezier(.16,1,.3,1), opacity .3s ease, background .4s ease, border-color .4s ease",
        }}
      >
        {isArrow ? (
          <svg
            width="17"
            height="17"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: mode === "prev" ? "rotate(180deg)" : "none",
              color: "var(--accent-soft)",
            }}
          >
            <path
              d="M2 8h11M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="square"
            />
          </svg>
        ) : null}

        {mode === "link" && label ? (
          <span
            className="mono-sm"
            style={{ color: "var(--accent-soft)", whiteSpace: "nowrap" }}
          >
            {label}
          </span>
        ) : null}
      </div>

      {/* the exact-position dot, hidden whenever the ring has taken a shape */}
      <div
        ref={dot}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 91,
          pointerEvents: "none",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "var(--accent-soft)",
          opacity: mode === "hidden" || isArrow || mode === "link" ? 0 : 1,
          transition: "opacity .25s ease",
        }}
      />
    </>
  );
}

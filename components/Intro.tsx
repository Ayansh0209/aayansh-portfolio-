"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";

const WORDS = ["Mapping systems", "Shipping tools", "Aayansh Singh"];

/**
 * The opening sequence. A counter runs to 100 while the grid draws itself in
 * and three lines cycle, then the whole panel clips upward to reveal the page.
 *
 * It runs once per tab — a reload inside the same session goes straight to the
 * site, so it never gets in the way while you are actually using it.
 */
export default function Intro() {
  // Rendered on the server too, so the panel is painted on the very first
  // frame. Otherwise the site flashes for the moment before hydration.
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);
  const [word, setWord] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-seen") === "1";
    } catch {
      // private mode or storage disabled — just play it
    }

    if (reduced || seen) {
      // drop it on the next frame rather than during the effect body
      raf.current = requestAnimationFrame(() => setShow(false));
      return () => cancelAnimationFrame(raf.current);
    }

    const DURATION = 2100;
    let start = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out so the count decelerates into 100 rather than hitting a wall
      const eased = 1 - Math.pow(1 - t, 2.2);
      setPct(Math.round(eased * 100));
      setWord(Math.min(WORDS.length - 1, Math.floor(t * WORDS.length)));

      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      setLeaving(true);
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {
        /* nothing to do */
      }
      window.setTimeout(() => {
        document.documentElement.style.overflow = "";
        setShow(false);
      }, 1100);
    };

    document.documentElement.style.overflow = "hidden";
    raf.current = requestAnimationFrame((now) => {
      start = now;
      raf.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf.current);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      data-intro
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--bg-deep)",
        clipPath: leaving ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
        transition: "clip-path 1s cubic-bezier(0.76, 0, 0.24, 1)",
        paddingInline: "var(--gutter)",
      }}
    >
      {/* the grid draws itself in behind everything */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px var(--grid)), repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px var(--grid))",
          maskImage: `linear-gradient(to bottom, #000 ${pct}%, transparent ${pct}%)`,
          WebkitMaskImage: `linear-gradient(to bottom, #000 ${pct}%, transparent ${pct}%)`,
        }}
      />

      {/* corner marks */}
      {(
        [
          ["top", "left"],
          ["top", "right"],
          ["bottom", "left"],
          ["bottom", "right"],
        ] as const
      ).map(([v, h]) => (
        <span
          key={`${v}${h}`}
          style={{
            position: "absolute",
            [v]: "22px",
            [h]: "var(--gutter)",
            width: 10,
            height: 10,
            [`border${v === "top" ? "Top" : "Bottom"}`]:
              "1px solid var(--line-strong)",
            [`border${h === "left" ? "Left" : "Right"}`]:
              "1px solid var(--line-strong)",
          }}
        />
      ))}

      <div className="relative flex h-full flex-col justify-between py-8">
        <span className="mono" style={{ color: "var(--faint)" }}>
          {profile.role} · {profile.location}
        </span>

        {/* the cycling line — the display class sits on the clipping box so
            the em units below resolve against the right font size */}
        <div
          className="display display-lg"
          style={{ overflow: "hidden", height: "1.2em" }}
        >
          <div
            style={{
              transform: `translateY(${-word * 1.2}em)`,
              transition: "transform .75s cubic-bezier(0.76, 0, 0.24, 1)",
            }}
          >
            {WORDS.map((wd, i) => (
              <div
                key={wd}
                style={{
                  height: "1.2em",
                  lineHeight: "1.2em",
                  color: i === WORDS.length - 1 ? "var(--text)" : "var(--muted)",
                }}
              >
                {wd}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <span
            className="display"
            style={{
              fontSize: "clamp(2.5rem, 9vw, 7rem)",
              lineHeight: 1,
              color: "var(--text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(pct).padStart(3, "0")}
          </span>
          <span className="mono" style={{ color: "var(--faint)" }}>
            Loading
          </span>
        </div>
      </div>

      {/* progress rule along the very bottom */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 2,
          width: `${pct}%`,
          background: "var(--accent-soft)",
          boxShadow: "0 0 12px 1px rgba(216,180,138,0.5)",
        }}
      />
    </div>
  );
}

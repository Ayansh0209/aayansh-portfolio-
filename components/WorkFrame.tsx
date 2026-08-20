"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Shot from "./Shot";
import LiveDemo from "./LiveDemo";
import Tilt from "./Tilt";
import SplitText from "./SplitText";
import { projects, links } from "@/lib/content";

const ProjectOrb = dynamic(() => import("./ProjectOrb"));

const N = projects.length;

/* ═══════════════════════════════════════════════════════════════
   A fixed bordered chassis — object cell / screens / portrait /
   tech rail / description, with a control bar underneath. The
   chassis never moves; the content inside each cell slides
   sideways in lockstep as the active project changes.
   ═══════════════════════════════════════════════════════════════ */
export default function WorkFrame() {
  const sectionRef = useRef<HTMLElement>(null);
  const [wide, setWide] = useState(false);
  const [travel, setTravel] = useState(0);
  const [hold, setHold] = useState(0);
  const [p, setP] = useState(0); // continuous 0 … N-1
  const [inView, setInView] = useState(false);

  /* ── layout mode + scroll budget ─────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const measure = () => {
      const on = mq.matches;
      setWide(on);
      if (!on) {
        setTravel(0);
        setHold(0);
        return;
      }
      setTravel((N - 1) * Math.round(window.innerHeight * 0.85));
      setHold(Math.round(window.innerHeight * 0.3));
    };

    measure();
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* ── only run the 3D object while the section is on screen ─ */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── scroll drives the slide position ────────────────────── */
  useEffect(() => {
    if (!wide || travel <= 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const raw = Math.min(1, Math.max(0, -rect.top / travel));
      setP(raw * (N - 1));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [wide, travel]);

  const active = Math.min(N - 1, Math.max(0, Math.round(p)));
  const project = projects[active];

  const goTo = useCallback(
    (i: number) => {
      const next = Math.min(N - 1, Math.max(0, i));
      if (wide && travel > 0 && sectionRef.current) {
        window.scrollTo({
          top: sectionRef.current.offsetTop + (next / (N - 1)) * travel,
          behavior: "smooth",
        });
      } else {
        setP(next);
      }
    },
    [wide, travel]
  );

  // percentage the inner tracks are shifted by
  const shift = -(p / N) * 100;
  const trackStyle: React.CSSProperties = {
    display: "flex",
    width: `${N * 100}%`,
    height: "100%",
    transform: `translate3d(${shift}%, 0, 0)`,
    willChange: "transform",
  };
  const slideStyle: React.CSSProperties = { width: `${100 / N}%`, flexShrink: 0 };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative"
      style={
        wide && travel > 0
          ? { height: `calc(100vh + ${travel + hold}px)` }
          : undefined
      }
    >
      <div
        className={
          wide
            ? "sticky top-0 flex h-screen flex-col justify-center"
            : "flex flex-col py-24"
        }
        style={{ paddingInline: "var(--gutter)" }}
      >
        {/* ── heading row ───────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-5" data-reveal>
          <div>
            <h2 className="display display-lg m-0">
              <SplitText text="Selected Work" />
            </h2>
            <p className="mono mt-2.5" style={{ color: "var(--faint)" }}>
              Shipped projects · not sketches
            </p>
          </div>

          <a
            href={links.email}
            className="cell mono flex items-center px-6 py-3.5"
            style={{ color: "var(--text)" }}
          >
            Start a project
          </a>
        </div>

        {/* ── the frame ─────────────────────────────────────── */}
        <div
          data-reveal
          style={{ border: "1px solid var(--line-strong)", background: "rgba(10,10,11,0.4)" }}
        >
          {/* media row */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: wide
                ? "1.5fr 2fr 0.75fr 62px 1fr"
                : "1fr",
              height: wide ? "clamp(330px, 46vh, 430px)" : "auto",
            }}
          >
            {/* 01 · the 3D object */}
            <div
              className={`relative ${wide ? "rule-r" : "rule-b"}`}
              style={{ height: wide ? "auto" : "230px" }}
            >
              <ProjectOrb active={active} inView={inView} />
              <span className="debug-text absolute bottom-3 left-4">
                transform: translateX({Math.round(shift * 6)}px)
              </span>
              <span className="debug-text absolute left-4 top-3">
                shape: {project.shape}
              </span>
            </div>

            {/* 02 · screens */}
            <div
              className={`relative overflow-hidden ${wide ? "rule-r" : "rule-b"}`}
              style={{ clipPath: "inset(0)" }}
            >
              <Tilt max={6} perspective={1500} className="h-full w-full" scope={2.2}>
                <div style={trackStyle}>
                  {projects.map((pr, i) => (
                    <div key={pr.index} style={slideStyle} className="h-full">
                      <div className="flex h-full flex-col gap-2 p-2.5">
                        {pr.demo ? (
                          <LiveDemo
                            project={pr}
                            active={inView && Math.abs(p - i) < 0.55}
                            className="w-full"
                            style={{ flex: "1.85", transform: "translateZ(0px)" }}
                          />
                        ) : (
                          <Shot
                            project={pr}
                            variant="hero"
                            src={pr.image}
                            seed={i}
                            className="w-full"
                            style={{ flex: "1.85", transform: "translateZ(0px)" }}
                          />
                        )}
                        <div
                          className="grid flex-1 grid-cols-2 gap-2"
                          style={{ transform: "translateZ(26px) scale(0.983)" }}
                        >
                          {[0, 1].map((g) => (
                            <div key={g} className="grid grid-cols-2 gap-1.5">
                              {[0, 1, 2, 3].map((t) => (
                                <Shot
                                  key={t}
                                  project={pr}
                                  variant="thumb"
                                  src={pr.thumbs?.[g * 4 + t]}
                                  seed={g * 4 + t + i}
                                  className="h-full w-full"
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tilt>
            </div>

            {/* 03 · portrait — redundant on a phone, so desktop only */}
            <div
              className={`relative overflow-hidden ${wide ? "rule-r" : "hidden"}`}
              style={{ clipPath: "inset(0)" }}
            >
              <Tilt max={9} perspective={1100} className="h-full w-full" scope={3}>
                <div style={trackStyle}>
                  {projects.map((pr, i) => (
                    <div key={pr.index} style={slideStyle} className="h-full">
                      <div
                        className="h-full p-2.5"
                        style={{ transform: "translateZ(26px) scale(0.976)" }}
                      >
                        <Shot
                          project={pr}
                          variant="portrait"
                          src={pr.mobileImage}
                          seed={i}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Tilt>
            </div>

            {/* 04 · tech rail */}
            <div
              className={`relative overflow-hidden ${wide ? "rule-r" : "rule-b"}`}
              style={{ clipPath: "inset(0)", height: wide ? "auto" : "46px" }}
            >
              <div style={trackStyle}>
                {projects.map((pr) => (
                  <div
                    key={pr.index}
                    style={slideStyle}
                    className={`flex h-full ${wide ? "flex-col" : "flex-row"}`}
                  >
                    {pr.rail.map((code) => (
                      <span
                        key={code}
                        className={`mono-sm flex flex-1 items-center justify-center ${
                          wide ? "rule-b" : "rule-r"
                        }`}
                        style={{ color: "var(--muted)", minHeight: wide ? "44px" : "auto" }}
                      >
                        {code}
                      </span>
                    ))}
                    <span
                      className="checker flex-1"
                      style={{ minHeight: wide ? "44px" : "auto" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 05 · description */}
            <div className="relative overflow-hidden" style={{ clipPath: "inset(0)" }}>
              <div style={trackStyle}>
                {projects.map((pr) => (
                  <div key={pr.index} style={slideStyle} className="h-full">
                    <div className="flex h-full flex-col p-5">
                      <p
                        className="m-0 mb-3.5"
                        style={{
                          fontSize: "0.8rem",
                          lineHeight: 1.62,
                          color: "var(--text)",
                        }}
                      >
                        {pr.blurb}
                      </p>
                      <p
                        className="m-0"
                        style={{
                          fontSize: "0.78rem",
                          lineHeight: 1.62,
                          color: "var(--muted)",
                        }}
                      >
                        {pr.detail}
                      </p>

                      <dl className="mt-auto flex flex-col gap-2 pt-4">
                        {pr.facts.map((f) => (
                          <div key={f.label} className="rule-t pt-1.5">
                            <dt className="mono-sm" style={{ color: "var(--faint)" }}>
                              {f.label}
                            </dt>
                            <dd
                              className="m-0 mt-0.5"
                              style={{ fontSize: "0.76rem", color: "var(--text)" }}
                            >
                              {f.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── control bar ─────────────────────────────────── */}
          <div
            className="rule-t grid items-stretch"
            style={{ gridTemplateColumns: "56px 58px 1fr 56px", minHeight: "58px" }}
          >
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous project"
              className="cell flex items-center justify-center"
              style={{
                border: "none",
                borderRight: "1px solid var(--line-strong)",
                background: "transparent",
                color: active === 0 ? "var(--faint)" : "var(--text)",
                cursor: active === 0 ? "default" : "pointer",
              }}
            >
              ‹
            </button>

            <a
              href={project.live ?? project.repo}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${project.name}`}
              className="cell flex items-center justify-center"
              style={{
                border: "none",
                borderRight: "1px solid var(--line-strong)",
                color: "var(--muted)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M5 2h7v7M12 2 2.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="square"
                />
              </svg>
            </a>

            {/* name — crossfades rather than slides, so it stays centred */}
            <div className="relative flex items-center justify-center overflow-hidden px-4">
              {projects.map((pr, i) => (
                <span
                  key={pr.index}
                  className="display absolute"
                  style={{
                    textTransform: "none",
                    letterSpacing: "0.06em",
                    fontSize: "clamp(0.95rem, 1.4vw, 1.25rem)",
                    color: "var(--text)",
                    opacity: Math.max(0, 1 - Math.abs(p - i) * 1.7),
                    transform: `translateY(${(p - i) * 14}px)`,
                  }}
                >
                  {pr.name}
                </span>
              ))}
              <span className="opacity-0">{project.name}</span>
            </div>

            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === N - 1}
              aria-label="Next project"
              className="cell flex items-center justify-center"
              style={{
                border: "none",
                borderLeft: "1px solid var(--line-strong)",
                background: "transparent",
                color: active === N - 1 ? "var(--faint)" : "var(--text)",
                cursor: active === N - 1 ? "default" : "pointer",
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* index readout under the frame */}
        <div className="mt-3 flex items-center justify-between">
          <span className="mono-sm" style={{ color: "var(--faint)" }}>
            {project.index} / {String(N).padStart(2, "0")} · {project.field}
          </span>
          <div className="flex items-center gap-2">
            {projects.map((pr, i) => (
              <button
                key={pr.index}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${pr.name}`}
                className="block"
                style={{
                  width: i === active ? "26px" : "12px",
                  height: "2px",
                  background: i === active ? "var(--accent-soft)" : "var(--line-strong)",
                  transition: "width 0.5s cubic-bezier(0.16,1,0.3,1), background 0.5s",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

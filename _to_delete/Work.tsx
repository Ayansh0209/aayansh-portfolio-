"use client";

import { useEffect, useRef, useState } from "react";
import ProjectVisual from "./ProjectVisual";
import SplitText from "./SplitText";
import { projects, type Project } from "@/lib/content";

/**
 * Horizontal carousel pinned with `position: sticky`. While the section is
 * pinned, vertical scroll progress maps to the track's translateX. Below
 * 900px it degrades to a plain vertical stack.
 */
export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [horizontal, setHorizontal] = useState(false);
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");

    const measure = () => {
      const on = mq.matches;
      setHorizontal(on);
      if (!on || !trackRef.current) {
        setTravel(0);
        return;
      }
      setTravel(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
      // a beat of extra scroll after the track finishes, so the last panel
      // is readable before the section unpins
      setHold(Math.round(window.innerHeight * 0.35));
    };

    measure();
    // re-measure once fonts settle, since panel widths depend on layout
    const id = window.setTimeout(measure, 350);

    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);

    return () => {
      window.clearTimeout(id);
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const pinned = horizontal && travel > 0;

    if (!pinned) {
      if (track) track.style.transform = "";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section || !track) return;

      const rect = section.getBoundingClientRect();
      // the horizontal move completes over `travel` px; the remaining height
      // of the section is the hold
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(travel, 1)));

      track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
      setActive(Math.min(projects.length - 1, Math.round(p * (projects.length - 1))));
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
  }, [horizontal, travel]);

  const pinned = horizontal && travel > 0;

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative"
      style={pinned ? { height: `calc(100vh + ${travel + hold}px)` } : undefined}
    >
      <div
        className={
          horizontal
            ? "flex h-screen flex-col overflow-hidden sticky top-0"
            : "flex flex-col py-24"
        }
      >
        {/* ── section head ─────────────────────────────────── */}
        <div
          className="relative z-20 flex shrink-0 items-end justify-between gap-6 pb-7 pt-24 md:pt-28"
          style={{ paddingInline: "var(--gutter)" }}
          data-reveal
        >
          <div>
            <h2 className="display display-lg m-0">
              <SplitText text="Selected Work" />
            </h2>
            <p className="mono mt-3" style={{ color: "var(--faint)" }}>
              Three projects · shipped, not sketched
            </p>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {projects.map((p, i) => (
              <span
                key={p.index}
                className="mono-sm transition-colors duration-500"
                style={{ color: i === active ? "var(--accent-soft)" : "var(--faint)" }}
              >
                {p.index}
              </span>
            ))}
            <span className="debug-text ml-3">
              translateX(-
              {Math.round((active / Math.max(projects.length - 1, 1)) * travel)}px)
            </span>
          </div>
        </div>

        {/* ── track ────────────────────────────────────────── */}
        <div className={horizontal ? "flex min-h-0 flex-1 items-center pb-14" : ""}>
          <div
            ref={trackRef}
            className={
              horizontal
                ? "flex w-max items-stretch gap-[5vw] will-change-transform"
                : "flex w-full flex-col gap-20"
            }
            style={{
              paddingInline: "var(--gutter)",
              height: horizontal ? "min(68vh, 620px)" : undefined,
            }}
          >
            {projects.map((p, i) => (
              <Panel key={p.index} project={p} index={i} horizontal={horizontal} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({
  project: p,
  index,
  horizontal,
}: {
  project: Project;
  index: number;
  horizontal: boolean;
}) {
  return (
    <article
      data-reveal
      style={{
        ["--d" as string]: `${index * 90}ms`,
        width: horizontal ? "min(70vw, 1020px)" : "100%",
      }}
      className={
        horizontal ? "grid shrink-0 grid-cols-[1fr_1fr] gap-10" : "flex flex-col gap-7"
      }
    >
      {/* visual */}
      <div className={horizontal ? "flex h-full min-h-0 items-center" : ""}>
        <ProjectVisual project={p} />
      </div>

      {/* copy */}
      <div className="flex min-h-0 flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="mono" style={{ color: "var(--faint)" }}>{p.index}</span>
          <span className="mono" style={{ color: "var(--faint)" }}>·</span>
          <span className="mono" style={{ color: "var(--text)" }}>{p.name}</span>
          <span className="mono" style={{ color: "var(--faint)" }}>·</span>
          <span className="mono" style={{ color: "var(--muted)" }}>{p.field}</span>
        </div>

        <h3
          className="display m-0 mb-4"
          style={{
            color: "var(--text)",
            textTransform: "none",
            letterSpacing: "0.02em",
            fontSize: "clamp(1.15rem, 1.65vw, 1.6rem)",
            lineHeight: 1.15,
          }}
        >
          {p.title}
        </h3>

        <p className="quote m-0 mb-4" style={{ color: "var(--accent-soft)" }}>
          &ldquo;{p.quote}&rdquo;
        </p>

        <p className="body-copy m-0" style={{ maxWidth: "52ch" }}>
          {p.body}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {p.facts.map((f) => (
            <div key={f.label} className="rule-t pt-2">
              <dt className="mono-sm" style={{ color: "var(--faint)" }}>{f.label}</dt>
              <dd className="m-0 mt-1 text-sm" style={{ color: "var(--text)" }}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-wrap gap-x-7 gap-y-2 pt-7">
          {p.live ? (
            <a href={p.live} target="_blank" rel="noreferrer noopener" className="mono link-underline">
              Live site ↗
            </a>
          ) : null}
          <a
            href={p.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="mono link-underline"
            style={{ color: "var(--muted)" }}
          >
            Source ↗
          </a>
        </div>
      </div>
    </article>
  );
}

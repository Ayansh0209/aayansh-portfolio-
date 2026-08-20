import dynamic from "next/dynamic";
import SplitText from "./SplitText";
import { profile, links } from "@/lib/content";

const ParticleSphere = dynamic(() => import("./ParticleSphere"));

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 ${className}`}
      style={{ borderColor: "var(--line-strong)" }}
    />
  );
}

export default function Hero() {
  const { headline } = profile;

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
      style={{ paddingInline: "var(--gutter)" }}
    >
      {/* ── centre stage ─────────────────────────────────────── */}
      <div
        className="hero-stage pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:z-10"
      >
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{ border: "1px solid var(--line-strong)" }}
        >
          <Corner className="-left-px -top-px border-l border-t" />
          <Corner className="-right-px -top-px border-r border-t" />
          <Corner className="-bottom-px -left-px border-b border-l" />
          <Corner className="-bottom-px -right-px border-b border-r" />
        </div>

        <span aria-hidden className="debug-text absolute -top-5 left-0 hidden md:block">
          blending: additive
        </span>
        <span aria-hidden className="debug-text absolute -bottom-5 right-0 hidden md:block">
          rotation.y += 0.11
        </span>

        <ParticleSphere />
      </div>

      {/* ── headline ─────────────────────────────────────────── */}
      <div className="relative z-20 w-full" data-reveal>
        <div className="flex flex-col items-start gap-0 md:flex-row md:items-center md:justify-between md:gap-4">
          <h1
            className="display display-xl m-0"
            style={{ color: "var(--text)", textShadow: "0 0 34px rgba(10,10,11,0.9)" }}
          >
            <span className="block">
              <SplitText text={headline.left[0]} delay={120} />
            </span>
            <span className="block" style={{ color: "var(--muted)" }}>
              <SplitText text={headline.left[1]} delay={320} />
            </span>
          </h1>

          <div
            className="display display-xl m-0 md:text-right"
            aria-hidden
            style={{ color: "var(--text)", textShadow: "0 0 34px rgba(10,10,11,0.9)" }}
          >
            <span className="block">
              <SplitText text={headline.right[0]} delay={480} />
            </span>
            <span className="block" style={{ color: "var(--muted)" }}>
              <SplitText text={headline.right[1]} delay={660} />
            </span>
          </div>
        </div>

        <span className="sr-only">
          {profile.name} — {profile.role}. {headline.left.join(" ")},{" "}
          {headline.right.join(" ")}.
        </span>
      </div>

      {/* ── numbered corner labels (desktop) ─────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-20 hidden md:block"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <div className="relative h-full w-full">
          <Label className="left-0" style={{ top: "27%" }} n="01" text={profile.role} />
          <Label
            className="right-0 text-right"
            style={{ top: "27%" }}
            n="02"
            text={profile.location}
            align="right"
          />
          <Label
            className="left-0"
            style={{ bottom: "25%" }}
            n="03"
            text={profile.email}
            href={links.email}
          />
          <Label
            className="right-0 text-right"
            style={{ bottom: "25%" }}
            n="04"
            text={profile.status}
            align="right"
            dot
          />
        </div>
      </div>

      {/* ── meta block (mobile) ──────────────────────────────── */}
      <div
        className="absolute bottom-20 left-0 z-20 flex flex-col gap-2 md:hidden"
        style={{ paddingInline: "var(--gutter)" }}
        data-reveal
      >
        <span className="mono" style={{ color: "var(--muted)" }}>
          01 — {profile.role}
        </span>
        <span className="mono" style={{ color: "var(--muted)" }}>
          02 — {profile.location}
        </span>
        <a
          className="mono link-underline w-fit"
          href={links.email}
          style={{ color: "var(--accent-soft)" }}
        >
          03 — {profile.email}
        </a>
        <span className="mono flex items-center" style={{ color: "var(--muted)" }}>
          <span
            aria-hidden
            className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--accent-soft)",
              boxShadow: "0 0 8px 1px rgba(216,180,138,0.7)",
            }}
          />
          04 — {profile.status}
        </span>
      </div>
    </section>
  );
}

function Label({
  n,
  text,
  className,
  style,
  align = "left",
  href,
  dot,
}: {
  n: string;
  text: string;
  className?: string;
  style?: React.CSSProperties;
  align?: "left" | "right";
  href?: string;
  dot?: boolean;
}) {
  const inner = (
    <>
      {align === "right" && dot ? (
        <span
          aria-hidden
          className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
          style={{
            background: "var(--accent-soft)",
            boxShadow: "0 0 8px 1px rgba(216,180,138,0.7)",
          }}
        />
      ) : null}
      <span style={{ color: "var(--faint)" }}>{n}.</span>{" "}
      <span style={{ color: "var(--muted)" }}>{text}</span>
    </>
  );

  return (
    <div className={`absolute mono ${className ?? ""}`} style={style}>
      {href ? (
        <a href={href} className="link-underline pointer-events-auto" style={{ color: "inherit" }}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}

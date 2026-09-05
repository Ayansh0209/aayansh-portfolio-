import Image from "next/image";
import type { Project } from "@/lib/content";

type Variant = "hero" | "thumb" | "portrait";

/**
 * A screenshot slot. Renders a real image when the project supplies one,
 * otherwise a placeholder built from the project's own tint and stack so the
 * frame reads as finished rather than empty.
 */
export default function Shot({
  project,
  variant,
  src,
  seed = 0,
  className,
  style,
  align = "top",
}: {
  project: Project;
  variant: Variant;
  src?: string;
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
  /** where to anchor the crop — thumbnails read better from the centre */
  align?: "top" | "center";
}) {
  const [a, b] = project.tint;

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        border: "1px solid var(--line-strong)",
        background: "var(--surface)",
        ...style,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${project.name} — ${variant}`}
          fill
          sizes="(max-width: 1024px) 40vw, 14vw"
          className={`object-cover ${align === "top" ? "object-top" : "object-center"}`}
        />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(130% 110% at ${
                12 + seed * 9
              }% 0%, ${a}22 0%, transparent 60%), linear-gradient(158deg, ${b} 0%, #0b0a0c 74%)`,
            }}
          />

          {variant === "hero" ? <HeroSkeleton project={project} accent={a} /> : null}
          {variant === "thumb" ? <ThumbSkeleton accent={a} seed={seed} /> : null}
          {variant === "portrait" ? (
            <PortraitSkeleton project={project} accent={a} />
          ) : null}
        </>
      )}
    </div>
  );
}

function Bar({
  w,
  accent,
  strong,
}: {
  w: string;
  accent?: string;
  strong?: boolean;
}) {
  return (
    <span
      aria-hidden
      className="block"
      style={{
        width: w,
        height: strong ? "5px" : "3px",
        background: accent ?? "rgba(232,224,214,0.14)",
        opacity: accent ? 0.55 : 1,
      }}
    />
  );
}

function HeroSkeleton({ project, accent }: { project: Project; accent: string }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-3"
        style={{
          height: "26px",
          borderBottom: "1px solid var(--line)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <i className="block h-1.5 w-1.5 rounded-full" style={{ background: "#3a3733" }} />
        <i className="block h-1.5 w-1.5 rounded-full" style={{ background: "#33302d" }} />
        <i className="block h-1.5 w-1.5 rounded-full" style={{ background: "#2d2a28" }} />
        <span className="debug-text ml-3 truncate">
          {(project.live ?? project.repo).replace("https://", "")}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[26px] flex flex-col justify-between p-5">
        <div className="flex flex-col gap-2">
          <Bar w="34%" accent={accent} strong />
          <Bar w="22%" />
        </div>

        <div>
          <span className="mono block mb-2" style={{ color: accent }}>
            {project.field}
          </span>
          <span
            className="display"
            style={{
              color: "rgba(236,231,224,0.94)",
              fontSize: "clamp(1rem, 1.6vw, 1.55rem)",
              letterSpacing: "0.1em",
            }}
          >
            {project.name}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {project.stack.slice(0, 5).map((s) => (
            <span key={s} className="mono-sm" style={{ color: "var(--faint)" }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function ThumbSkeleton({ accent, seed }: { accent: string; seed: number }) {
  const widths = ["62%", "44%", "78%", "52%"];
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-2.5">
      <span
        aria-hidden
        className="block w-full"
        style={{
          height: "34%",
          background: seed % 2 === 0 ? `${accent}1f` : "rgba(232,224,214,0.05)",
          border: "1px solid var(--line)",
        }}
      />
      <Bar w={widths[seed % 4]} accent={seed % 3 === 0 ? accent : undefined} />
      <Bar w={widths[(seed + 1) % 4]} />
      <Bar w={widths[(seed + 2) % 4]} />
    </div>
  );
}

function PortraitSkeleton({
  project,
  accent,
}: {
  project: Project;
  accent: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col p-3">
      <div
        aria-hidden
        className="mb-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}
      >
        <span className="mono-sm" style={{ color: accent }}>
          {project.index}
        </span>
        <span
          aria-hidden
          className="block"
          style={{ width: "16px", height: "2px", background: "rgba(232,224,214,0.2)" }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Bar w="80%" accent={accent} strong />
        <Bar w="58%" />
        <Bar w="66%" />
      </div>

      <span
        aria-hidden
        className="mt-4 block w-full flex-1"
        style={{
          background: `linear-gradient(180deg, ${accent}1a, transparent 70%)`,
          border: "1px solid var(--line)",
        }}
      />

      <div className="mt-3 flex flex-col gap-1.5">
        <Bar w="70%" />
        <Bar w="45%" />
      </div>
    </div>
  );
}

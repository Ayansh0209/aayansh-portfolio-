import Image from "next/image";
import type { Project } from "@/lib/content";

/**
 * Drop a screenshot at /public/work/<file> and set `image` on the project in
 * lib/content.ts — it replaces the generated card with no other changes.
 */
export default function ProjectVisual({
  project,
  fill = false,
}: {
  project: Project;
  fill?: boolean;
}) {
  const [a, b] = project.tint;

  return (
    <div
      className={`relative w-full overflow-hidden ${fill ? "h-full" : ""}`}
      style={{
        aspectRatio: fill ? undefined : "16 / 10",
        minHeight: fill ? "200px" : undefined,
        border: "1px solid var(--line-strong)",
        background: "var(--surface)",
      }}
    >
      {project.image ? (
        <Image
          src={project.image}
          alt={`${project.name} interface`}
          fill
          sizes="(max-width: 900px) 92vw, 46vw"
          className="object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 100% at 14% 4%, ${a}26 0%, transparent 58%), linear-gradient(155deg, ${b} 0%, #0c0b0d 72%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, rgba(232,224,214,0.06) 0 1px, transparent 1px 38px), repeating-linear-gradient(to bottom, rgba(232,224,214,0.06) 0 1px, transparent 1px 38px)",
              maskImage:
                "radial-gradient(circle at 26% 26%, #000 6%, transparent 74%)",
              WebkitMaskImage:
                "radial-gradient(circle at 26% 26%, #000 6%, transparent 74%)",
            }}
          />

          {/* window chrome so the card reads as a product, not a swatch */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-4"
            style={{
              height: "30px",
              borderBottom: "1px solid var(--line)",
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <i className="block h-1.5 w-1.5 rounded-full" style={{ background: "#3a3733" }} />
            <i className="block h-1.5 w-1.5 rounded-full" style={{ background: "#33302d" }} />
            <i className="block h-1.5 w-1.5 rounded-full" style={{ background: "#2d2a28" }} />
            <span className="debug-text ml-3 truncate">
              {project.repo.replace("https://", "")}
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-6 pt-8 sm:px-9">
            <span className="mono mb-3" style={{ color: a }}>
              {project.field}
            </span>
            <span
              className="display display-lg"
              style={{ color: "rgba(236,231,224,0.92)" }}
            >
              {project.name}
            </span>
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
              {project.stack.map((s) => (
                <span key={s} className="mono-sm" style={{ color: "var(--faint)" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <span className="debug-text absolute bottom-3 right-4">
            placeholder · drop a shot in /public/work
          </span>
        </>
      )}
    </div>
  );
}

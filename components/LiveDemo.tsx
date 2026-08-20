"use client";

import dynamic from "next/dynamic";
import type { Project } from "@/lib/content";

const LiveGraph = dynamic(() => import("./LiveGraph"));
const LiveTrace = dynamic(() => import("./LiveTrace"));

/**
 * The big slot in the work frame. For the two projects that are themselves
 * animated, this runs a real working miniature of what they do rather than
 * showing a still — a rotating 3D dependency graph, and a bubble sort being
 * traced step by step. Nothing here is a video or a gif.
 */
export default function LiveDemo({
  project,
  active,
  className,
  style,
}: {
  project: Project;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [a] = project.tint;

  return (
    <div
      className={`relative flex flex-col overflow-hidden ${className ?? ""}`}
      style={{
        border: "1px solid var(--line-strong)",
        background: "var(--surface)",
        minHeight: 0,
        ...style,
      }}
    >
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-1.5 px-3"
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
          {project.demo === "graph" ? "dependency map" : "bubble_sort.py"}
        </span>

        <span className="ml-auto flex items-center gap-1.5">
          <i
            className="block h-1 w-1 rounded-full"
            style={{
              background: a,
              boxShadow: `0 0 6px 1px ${a}`,
            }}
          />
          <span className="debug-text" style={{ color: a, opacity: 0.9 }}>
            live
          </span>
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        {project.demo === "graph" ? (
          <LiveGraph active={active} />
        ) : (
          <LiveTrace active={active} />
        )}
      </div>
    </div>
  );
}

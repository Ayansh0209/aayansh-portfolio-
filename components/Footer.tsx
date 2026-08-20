import { profile } from "@/lib/content";

export default function Footer() {
  return (
    <footer
      className="relative rule-t pb-24 pt-8"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="mono-sm" style={{ color: "var(--faint)" }}>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="mono-sm" style={{ color: "var(--faint)" }}>
          Built with Next.js · Three.js · no template
        </span>
        <span className="mono-sm" style={{ color: "var(--faint)" }}>
          {profile.location}
        </span>
      </div>
    </footer>
  );
}

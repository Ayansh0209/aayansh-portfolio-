import SplitText from "./SplitText";
import { profile, stack } from "@/lib/content";

export default function About() {
  return (
    <section
      id="about"
      className="relative py-24 md:py-36"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div data-reveal>
          <span className="mono mb-6 block" style={{ color: "var(--faint)" }}>
            04 · About
          </span>
          <h2 className="display display-lg m-0">
            <SplitText text="End to end" />
          </h2>

          <p
            className="quote m-0 mt-8"
            style={{ color: "var(--accent-soft)", maxWidth: "22ch" }}
          >
            &ldquo;From a rough idea to something deployed that people use.&rdquo;
          </p>
        </div>

        <div data-reveal style={{ ["--d" as string]: "120ms" }}>
          <p className="body-copy m-0" style={{ maxWidth: "60ch" }}>
            {profile.intro}
          </p>
          <p className="body-copy m-0 mt-5" style={{ maxWidth: "60ch" }}>
            {profile.intro2}
          </p>

          {/* ── stack ─────────────────────────────────────────── */}
          <div className="mt-14">
            <div className="mb-6 flex items-baseline justify-between">
              <span className="mono" style={{ color: "var(--faint)" }}>
                Stack
              </span>
              <span className="mono-sm" style={{ color: "var(--faint)" }}>
                {String(stack.length).padStart(2, "0")} — technologies
              </span>
            </div>

            <ul
              className="m-0 grid list-none grid-cols-2 p-0 sm:grid-cols-3 lg:grid-cols-4"
              style={{
                borderTop: "1px solid var(--line-strong)",
                borderLeft: "1px solid var(--line-strong)",
              }}
            >
              {stack.map((name, i) => (
                <li
                  key={name}
                  data-cursor="tag"
                  className="group relative overflow-hidden"
                  style={{
                    borderRight: "1px solid var(--line-strong)",
                    borderBottom: "1px solid var(--line-strong)",
                  }}
                >
                  {/* accent sweeps up from the base on hover */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0 transition-[height] duration-500 ease-out group-hover:h-full"
                    style={{ background: "rgba(176,128,82,0.1)" }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
                    style={{ background: "var(--accent)" }}
                  />

                  <div className="relative flex items-baseline gap-2.5 px-4 py-4 sm:px-5 sm:py-5">
                    <span
                      className="mono-sm shrink-0 transition-colors duration-500"
                      style={{ color: "var(--faint)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="display transition-colors duration-500 group-hover:text-[var(--accent-soft)]"
                      style={{
                        textTransform: "none",
                        letterSpacing: "0.04em",
                        fontSize: "clamp(0.9rem, 1.15vw, 1.05rem)",
                        color: "var(--text)",
                      }}
                    >
                      {name}
                    </span>
                  </div>
                </li>
              ))}

              {/* fill the ragged last row so the grid closes cleanly */}
              {Array.from({
                length: (4 - (stack.length % 4)) % 4,
              }).map((_, i) => (
                <li
                  key={`fill-${i}`}
                  aria-hidden
                  className="checker"
                  style={{
                    borderRight: "1px solid var(--line-strong)",
                    borderBottom: "1px solid var(--line-strong)",
                    minHeight: "58px",
                  }}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

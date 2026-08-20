import SplitText from "./SplitText";
import { profile, stack } from "@/lib/content";

export default function About() {
  return (
    <section
      id="about"
      className="relative py-24 md:py-36"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div data-reveal>
          <span className="mono block mb-6" style={{ color: "var(--faint)" }}>
            04 · About
          </span>
          <h2 className="display display-lg m-0">
            <SplitText text="End to end" />
          </h2>
        </div>

        <div data-reveal style={{ ["--d" as string]: "120ms" }}>
          <p
            className="quote m-0 mb-8"
            style={{ color: "var(--accent-soft)" }}
          >
            &ldquo;From a rough idea to something deployed that people use.&rdquo;
          </p>

          <p className="body-copy m-0" style={{ maxWidth: "58ch" }}>
            {profile.intro}
          </p>

          {/* tech rail */}
          <div className="mt-12">
            <span className="mono block mb-5" style={{ color: "var(--faint)" }}>
              Stack — honest levels
            </span>

            <ul className="m-0 flex list-none flex-wrap gap-x-1 gap-y-3 p-0">
              {stack.map((s, i) => (
                <li key={s.name} className="flex items-center">
                  <span
                    className="mono transition-colors duration-300"
                    style={{
                      color:
                        s.level === "advanced"
                          ? "var(--text)"
                          : "var(--muted)",
                    }}
                    title={s.level}
                  >
                    {s.name}
                  </span>
                  {s.level === "advanced" ? (
                    <span
                      aria-hidden
                      className="ml-1.5 inline-block h-1 w-1 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  ) : null}
                  {i < stack.length - 1 ? (
                    <span
                      aria-hidden
                      className="mono mx-3"
                      style={{ color: "var(--faint)" }}
                    >
                      /
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            <p className="mono-sm mt-6" style={{ color: "var(--faint)" }}>
              <span
                aria-hidden
                className="mr-2 inline-block h-1 w-1 rounded-full align-middle"
                style={{ background: "var(--accent)" }}
              />
              advanced · everything else intermediate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

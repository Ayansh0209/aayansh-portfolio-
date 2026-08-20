import SplitText from "./SplitText";
import Tilt from "./Tilt";
import { services } from "@/lib/content";

export default function Services() {
  return (
    <section
      id="services"
      className="relative py-28 md:py-40"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6" data-reveal>
        <h2 className="display display-lg m-0">
          <SplitText text="What I do" />
        </h2>
        <p
          className="quote m-0 max-w-md text-right"
          style={{ color: "var(--muted)" }}
        >
          &ldquo;The work first, the interface in retreat.&rdquo;
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {services.map((s, i) => (
          <Tilt
            key={s.index}
            max={5}
            perspective={1100}
            scope={1.1}
            className="group relative rule-t"
          >
          <article
            data-reveal
            style={{ ["--d" as string]: `${i * 110}ms`, transformStyle: "preserve-3d" }}
            className="relative px-0 py-8 md:px-7 md:py-10"
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 h-px w-0 transition-all duration-700 ease-out group-hover:w-full"
              style={{ background: "var(--accent)" }}
            />

            <span
              className="mono block"
              style={{ color: "var(--faint)", transform: "translateZ(38px)" }}
            >
              {s.index}
            </span>

            <h3
              className="display display-md m-0 mb-4 mt-5"
              style={{
                textTransform: "none",
                letterSpacing: "0.03em",
                transform: "translateZ(26px)",
              }}
            >
              {s.title}
            </h3>

            <p className="body-copy m-0">{s.body}</p>

            <div
              className="mt-7 flex flex-wrap gap-x-3 gap-y-2"
              style={{ transform: "translateZ(16px)" }}
            >
              {s.tags.map((t) => (
                <span
                  key={t}
                  className="mono-sm px-2 py-1"
                  style={{
                    color: "var(--muted)",
                    border: "1px solid var(--line-strong)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

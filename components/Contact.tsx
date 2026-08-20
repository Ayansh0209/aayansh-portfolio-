import SplitText from "./SplitText";
import { profile, links } from "@/lib/content";

const CHANNELS = [
  { label: "Email", value: profile.email, href: links.email },
  { label: "GitHub", value: "Ayansh0209", href: links.github },
  { label: "LinkedIn", value: "aayansh-singh", href: links.linkedin },
  { label: "Wellfound", value: "aayansh-singh-4", href: links.wellfound },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative pb-32 pt-24 md:pb-40 md:pt-36"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="rule-t pt-14" data-reveal>
        <span className="mono block mb-8" style={{ color: "var(--faint)" }}>
          05 · Contact
        </span>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <h2 className="display display-xl m-0">
            <SplitText text="Let's build" />
            <span className="block" style={{ color: "var(--muted)" }}>
              <SplitText text="something" delay={220} />
            </span>
          </h2>

          <a
            href={links.email}
            className="group flex items-center gap-4 px-6 py-4"
            style={{ border: "1px solid var(--line-strong)" }}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent-soft)",
                boxShadow: "0 0 10px 1px rgba(216,180,138,0.7)",
              }}
            />
            <span className="mono" style={{ color: "var(--text)" }}>
              {profile.status}
            </span>
            <span
              aria-hidden
              className="transition-transform duration-500 group-hover:translate-x-1.5"
              style={{ color: "var(--accent-soft)" }}
            >
              →
            </span>
          </a>
        </div>

        <ul className="m-0 mt-16 grid list-none grid-cols-1 gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c, i) => (
            <li
              key={c.label}
              data-reveal
              style={{ ["--d" as string]: `${i * 80}ms` }}
              className="rule-t py-5 sm:pr-8"
            >
              <span className="mono-sm block mb-2" style={{ color: "var(--faint)" }}>
                {c.label}
              </span>
              <a
                href={c.href}
                target={c.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="link-underline break-all text-sm"
              >
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

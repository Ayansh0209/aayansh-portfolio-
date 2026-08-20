import { Fragment } from "react";

/**
 * Splits a string into per-character spans with staggered transition delays.
 * The reveal itself is driven by the ancestor's [data-reveal="in"] state,
 * so this stays a server component — no JS shipped for the stagger.
 */
export default function SplitText({
  text,
  className = "",
  delay = 0,
  step = 26,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  let i = 0;

  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const d = delay + i * step;
              i += 1;
              return (
                <span
                  key={ci}
                  aria-hidden
                  className="char"
                  style={{ transitionDelay: `${d}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

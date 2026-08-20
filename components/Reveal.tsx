"use client";

import { useEffect } from "react";

/**
 * One observer for every `[data-reveal]` on the page. Elements animate in
 * once and are then unobserved — nothing re-runs on the way back up.
 */
export default function Reveal() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.setAttribute("data-reveal", "in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal", "in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    nodes.forEach((n) => io.observe(n));

    // late-mounted nodes (client components hydrating after this ran)
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          const found = n.matches("[data-reveal]")
            ? [n]
            : Array.from(n.querySelectorAll<HTMLElement>("[data-reveal]"));
          found.forEach((el) => {
            if (el.getAttribute("data-reveal") !== "in") io.observe(el);
          });
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

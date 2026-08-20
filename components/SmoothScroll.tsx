"use client";

import { useEffect } from "react";

/**
 * Weighted inertial scroll, ~40 lines of the thing Lenis does.
 *
 * It drives the real window scroll position (rather than transforming a
 * wrapper), so `position: sticky`, anchor links, scroll listeners and the
 * IntersectionObserver reveals all keep working normally.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // native momentum on touch is better than anything we'd fake
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const EASE = 0.085;
    const MULT = 1.0;

    let target = window.scrollY;
    let current = window.scrollY;
    let animating = false;
    let raf = 0;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const clamp = (v: number) => Math.min(Math.max(v, 0), maxScroll());

    const loop = () => {
      const delta = target - current;

      if (Math.abs(delta) < 0.35) {
        current = target;
        window.scrollTo(0, current);
        animating = false;
        raf = 0;
        return;
      }

      current += delta * EASE;
      window.scrollTo(0, current);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (animating) return;
      animating = true;
      raf = requestAnimationFrame(loop);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      // let genuinely scrollable inner panes (code blocks, etc.) do their thing
      let node = e.target as HTMLElement | null;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (
          /(auto|scroll)/.test(style.overflowY) &&
          node.scrollHeight > node.clientHeight + 1
        ) {
          return;
        }
        node = node.parentElement;
      }

      e.preventDefault();

      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; // lines
      else if (e.deltaMode === 2) dy *= window.innerHeight; // pages

      if (!animating) current = window.scrollY;
      target = clamp(target + dy * MULT);
      start();
    };

    // any non-wheel scroll (keyboard, scrollbar drag, anchor jump) re-syncs us
    const onScroll = () => {
      if (!animating) {
        current = window.scrollY;
        target = window.scrollY;
      }
    };

    const onResize = () => {
      target = clamp(target);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}

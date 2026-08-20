"use client";

import { useEffect, useState } from "react";

const NAV = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [clock, setClock] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
    const tick = () => setClock(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div
        className="flex items-stretch justify-between"
        style={{ paddingInline: "var(--gutter)", paddingTop: "18px" }}
      >
        {/* left: identity */}
        <div className="flex items-stretch">
          <a
            href="#top"
            onClick={go("#top")}
            className="cell mono flex items-center px-4 py-2.5 backdrop-blur-sm"
            style={{ background: "rgba(10,10,11,0.55)" }}
          >
            <span style={{ color: "var(--accent-soft)" }}>AAYANSH</span>
            <span style={{ color: "var(--muted)" }}>&nbsp;SINGH</span>
          </a>
          <span
            className="cell mono hidden items-center px-3 py-2.5 sm:flex"
            style={{
              borderLeft: "none",
              color: "var(--faint)",
              background: "rgba(10,10,11,0.55)",
            }}
          >
            AS
          </span>
        </div>

        {/* right: nav */}
        <div className="flex items-stretch">
          <nav className="hidden items-stretch md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={go(item.href)}
                className="cell mono flex items-center px-4 py-2.5 backdrop-blur-sm"
                style={{
                  borderRight: "none",
                  color: "var(--muted)",
                  background: "rgba(10,10,11,0.55)",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <span
            className="cell mono hidden items-center px-3 py-2.5 md:flex"
            style={{
              color: "var(--faint)",
              background: "rgba(10,10,11,0.55)",
              minWidth: "68px",
              justifyContent: "center",
            }}
          >
            {clock || "--:--"}
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="cell mono flex items-center px-4 py-2.5 md:hidden"
            style={{ color: "var(--muted)", background: "rgba(10,10,11,0.55)" }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        className="overflow-hidden md:hidden"
        style={{
          paddingInline: "var(--gutter)",
          maxHeight: open ? "320px" : "0px",
          transition: "max-height 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <nav
          className="mt-[-1px] flex flex-col"
          style={{ background: "rgba(10,10,11,0.94)" }}
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={go(item.href)}
              className="cell display display-md px-4 py-4"
              style={{ borderTop: "none", color: "var(--text)" }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const links = [
  { href: "/#about", label: "About", index: "01" },
  { href: "/#stack", label: "Stack", index: "02" },
  { href: "/#experience", label: "Experience", index: "03" },
  { href: "/#work", label: "Work", index: "04" },
  { href: "/blog", label: "Writing", index: "05" },
  { href: "/#contact", label: "Contact", index: "06" },
];

/** Local time where he actually is — small, true, and not something a template does. */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kathmandu",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span className="label hidden items-center gap-2 lg:flex">
      <span className="inline-block h-1 w-1 rounded-full bg-acid" />
      KTM {time}
    </span>
  );
}

export default function Navbar() {
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Hide going down, reveal coming up — keeps the reading area clear.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = header.current;
    if (!el) return;

    let last = window.scrollY;
    let hidden = false;

    const onScroll = () => {
      const y = window.scrollY;
      const down = y > last && y > 220;
      last = y;
      if (down === hidden) return;
      hidden = down;
      gsap.to(el, {
        yPercent: down ? -110 : 0,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile overlay.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        ref={header}
        className="fixed inset-x-0 top-0 z-[60] mix-blend-difference"
      >
        <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="font-display text-xl leading-none tracking-tight text-bone"
            data-cursor
          >
            Shivaprasad<span className="text-acid">.</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="swap text-sm text-bone/85" data-cursor>
                  <span>{l.label}</span>
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <LocalTime />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="label flex items-center gap-2 text-bone md:hidden"
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? "Close" : "Menu"}
              <span className="flex h-3 w-4 flex-col justify-between">
                <span
                  className={`block h-px w-full bg-current transition-transform duration-300 ${
                    open ? "translate-y-[5.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-px w-full bg-current transition-opacity duration-300 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-px w-full bg-current transition-transform duration-300 ${
                    open ? "-translate-y-[5.5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-50 bg-ink md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
          transition: "clip-path .7s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div className="flex h-full flex-col justify-center px-6">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="group flex items-baseline gap-4 border-b border-rule py-4"
              style={{
                transitionDelay: `${open ? 150 + i * 45 : 0}ms`,
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(18px)",
                transition: "opacity .5s ease, transform .5s ease",
              }}
            >
              <span className="label">{l.index}</span>
              <span className="display-md text-bone group-hover:text-acid">
                {l.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

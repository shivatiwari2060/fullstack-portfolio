"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { completeIntro, hasSeenIntro, markIntroSeen } from "@/lib/intro";
import { startScroll, stopScroll } from "./providers/SmoothScroll";

const COLUMNS = 6;

/**
 * The loading curtain. It exists once per session — long enough to set the
 * tone, short enough that nobody waiting on it gets annoyed.
 */
export default function Preloader() {
  const [show, setShow] = useState<boolean | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const skip = hasSeenIntro() || prefersReducedMotion();
    if (skip) completeIntro();
    // Decided in an effect rather than a state initialiser on purpose: this
    // component is server-rendered and sessionStorage only exists on the
    // client, so deciding during render would desync the two trees.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(!skip);
  }, []);

  useEffect(() => {
    if (!show || !root.current) return;

    // Lenis is created by the parent provider, whose effect runs after this
    // one — so lock the document directly and stop Lenis as a belt-and-braces.
    document.body.style.overflow = "hidden";
    stopScroll();
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const count = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          markIntroSeen();
          completeIntro();
          document.body.style.overflow = "";
          startScroll();
          setShow(false);
        },
      });

      tl.to(count, {
        v: 100,
        duration: 1.9,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter.current) {
            counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
          }
        },
      })
        .to(bar.current, { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
        .to(
          "[data-preload-meta]",
          { yPercent: -110, opacity: 0, duration: 0.6, ease: "power3.in", stagger: 0.05 },
          "-=0.15",
        )
        // The curtain leaves as vertical slats — a deliberate, staged exit.
        .to(
          "[data-preload-col]",
          {
            scaleY: 0,
            transformOrigin: "top",
            duration: 0.9,
            ease: "expo.inOut",
            stagger: { each: 0.06, from: "start" },
          },
          "-=0.25",
        );
    }, root);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
      startScroll();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[9997] flex items-end"
      aria-hidden
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <div
            key={i}
            data-preload-col
            className="h-full flex-1 bg-ink"
            style={{ willChange: "transform" }}
          />
        ))}
      </div>

      <div className="relative w-full px-6 pb-10 sm:px-10 sm:pb-14">
        <div
          data-preload-meta
          className="mb-8 flex items-baseline justify-between"
        >
          <span className="label">Shivaprasad Tiwari</span>
          <span className="label">Portfolio — Ed. 2026</span>
        </div>

        <div
          data-preload-meta
          className="flex items-end justify-between gap-6"
        >
          <p className="display-lg leading-none text-bone">
            <span ref={counter} className="tabular">
              000
            </span>
            <span className="text-bone-muted">%</span>
          </p>
          <p className="label mb-2 hidden sm:block">Loading assets</p>
        </div>

        <div className="mt-8 h-px w-full bg-rule">
          <div
            ref={bar}
            className="h-px w-full origin-left scale-x-0 bg-acid"
          />
        </div>
      </div>
    </div>
  );
}

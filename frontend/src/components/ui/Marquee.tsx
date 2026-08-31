"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Continuous horizontal run of items. Scrolling the page speeds it up and can
 * reverse it, which ties the marquee to the reader instead of leaving it as
 * ambient movement.
 */
export default function Marquee({
  children,
  speed = 38,
  reverse = false,
  className,
}: {
  children: ReactNode;
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    const tween = gsap.fromTo(
      el,
      { xPercent: reverse ? -50 : 0 },
      {
        xPercent: reverse ? 0 : -50,
        duration: speed,
        ease: "none",
        repeat: -1,
      },
    );

    // Scroll surges the speed; a short idle timer eases it back to the baseline.
    let settle = 0;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const sign = velocity > 0 ? 1 : -1;
        const boost = gsap.utils.clamp(1, 4, 1 + Math.abs(velocity) / 1100);

        gsap.killTweensOf(tween);
        tween.timeScale(sign * boost);

        window.clearTimeout(settle);
        settle = window.setTimeout(() => {
          gsap.to(tween, { timeScale: 1, duration: 0.9, overwrite: true });
        }, 140);
      },
    });

    return () => {
      window.clearTimeout(settle);
      gsap.killTweensOf(tween);
      st.kill();
      tween.kill();
    };
  }, [speed, reverse]);

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

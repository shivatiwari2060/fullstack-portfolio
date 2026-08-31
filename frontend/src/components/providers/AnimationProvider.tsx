"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Elements marked `data-anim` are hidden by CSS until this flips the switch,
 * which prevents a flash of un-animated text on first paint.
 *
 * Runs after child effects (React commits bottom-up), so every component has
 * already set its start state by the time we reveal. The timeout is a
 * failsafe — a font that never resolves must not leave the page blank.
 */
export default function AnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      requestAnimationFrame(() => {
        document.body.classList.add("anim-ready");
        ScrollTrigger.refresh();
      });
    };

    if (document.fonts) document.fonts.ready.then(reveal).catch(reveal);
    else reveal();

    const failsafe = window.setTimeout(reveal, 2500);
    return () => window.clearTimeout(failsafe);
  }, []);

  return <>{children}</>;
}

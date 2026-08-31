"use client";

import { useEffect, useRef } from "react";
import type { ReactNode, Ref } from "react";
import { EASE, gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";

/** Wait for webfonts so SplitText measures real glyph metrics, not fallbacks. */
function whenFontsReady(cb: () => void) {
  if (typeof document === "undefined") return;
  if (!document.fonts || document.fonts.status === "loaded") {
    cb();
    return;
  }
  document.fonts.ready.then(cb).catch(cb);
}

/* -------------------------------------------------------------------------- */

/**
 * Headline reveal. Lines slide up from behind a mask — the move that makes
 * type read as typeset rather than merely animated.
 */
export function TextReveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  stagger = 0.09,
  split = "lines",
  start = "top 85%",
  play,
}: {
  children: ReactNode;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  stagger?: number;
  split?: "lines" | "chars";
  start?: string;
  /** Optional gate — the hero waits for the preloader before playing. */
  play?: Promise<void>;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let instance: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let trigger: ScrollTrigger | null = null;
    let cancelled = false;

    whenFontsReady(() => {
      if (cancelled || !ref.current) return;

      instance = new SplitText(ref.current, {
        type: split === "chars" ? "chars,lines" : "lines",
        linesClass: "split-line",
      });
      const targets = split === "chars" ? instance.chars : instance.lines;

      gsap.set(targets, { yPercent: 115 });

      const run = () => {
        if (cancelled || !ref.current) return;
        tween = gsap.to(targets, {
          yPercent: 0,
          duration: 1.15,
          ease: EASE,
          stagger: split === "chars" ? stagger * 0.28 : stagger,
          delay,
          paused: true,
        });

        trigger = ScrollTrigger.create({
          trigger: ref.current,
          start,
          once: true,
          onEnter: () => tween?.play(),
        });
      };

      if (play) play.then(run);
      else run();
    });

    return () => {
      cancelled = true;
      trigger?.kill();
      tween?.kill();
      instance?.revert();
    };
  }, [delay, stagger, split, start, play]);

  // All permitted tags take the same props here, so narrowing to one of them
  // gives TypeScript something concrete to check the ref against.
  const Component = Tag as "div";

  return (
    <Component
      ref={ref as Ref<HTMLDivElement>}
      data-anim="text"
      className={className}
    >
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------- */

/** Plain rise-and-fade for blocks that aren't type. */
export function Rise({
  children,
  className,
  delay = 0,
  y = 40,
  start = "top 88%",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: EASE,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, y, start]);

  return (
    <div ref={ref} data-anim="rise" className={className}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Word-by-word brightening tied to scroll position. Reserved for the single
 * statement paragraph — it holds attention because nothing else does it.
 */
export function ScrubWords({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let instance: SplitText | null = null;
    let cancelled = false;

    whenFontsReady(() => {
      if (cancelled || !ref.current) return;
      instance = new SplitText(ref.current, { type: "words" });

      gsap.fromTo(
        instance.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 60%",
            scrub: true,
          },
        },
      );
    });

    return () => {
      cancelled = true;
      instance?.revert();
    };
  }, [text]);

  return (
    <p ref={ref} data-anim="words" className={className}>
      {text}
    </p>
  );
}

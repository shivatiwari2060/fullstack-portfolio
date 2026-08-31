"use client";

import { cloneElement, isValidElement, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Pulls its child toward the pointer while hovered. Used sparingly — on the
 * two hero CTAs and the contact button — so it reads as craft, not gimmick.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactElement<{ ref?: React.Ref<HTMLElement> }>;
  strength?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = wrap.firstElementChild as HTMLElement | null;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.4)" });

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  if (!isValidElement(children)) return children;

  return (
    <div ref={wrapRef} className={`inline-block ${className ?? ""}`}>
      {cloneElement(children)}
    </div>
  );
}

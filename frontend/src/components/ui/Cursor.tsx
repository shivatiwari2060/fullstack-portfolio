"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const INTERACTIVE = "[data-cursor], a, button";

/**
 * Two-part cursor: a hard dot that tracks 1:1 and a ring that lags behind.
 * Elements opt into states with `data-cursor="view"` / `data-cursor-label="…"`.
 */
export default function Cursor() {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  const enabled = !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || prefersReducedMotion()) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-cursor");
    setActive(true);

    // Centre both layers on the pointer so growing the ring stays concentric.
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    let visible = false;
    let lastX = -1;
    let lastY = -1;
    let stateKey = "";

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], {
        autoAlpha: 1,
        duration: 0.25,
        overwrite: "auto",
      });
    };

    const hide = () => {
      if (!visible) return;
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
    };

    /** Idle / hover / label state, keyed so scroll ticks don't restart tweens. */
    const applyState = (el: HTMLElement | null) => {
      const text = el?.dataset?.cursorLabel;
      const key = text ? `label:${text}` : el ? "hover" : "idle";
      if (key === stateKey) return;
      stateKey = key;

      if (text) {
        label.textContent = text;
        gsap.to(ring, {
          width: 84,
          height: 84,
          borderColor: "transparent",
          backgroundColor: "var(--acid)",
          duration: 0.45,
          ease: "expo.out",
        });
        gsap.to(label, { autoAlpha: 1, duration: 0.3 });
        gsap.to(dot, { scale: 0, duration: 0.3 });
      } else if (el) {
        gsap.to(ring, {
          width: 52,
          height: 52,
          borderColor: "var(--acid)",
          backgroundColor: "rgba(198,242,78,0.08)",
          duration: 0.45,
          ease: "expo.out",
        });
        gsap.to(label, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { scale: 0, duration: 0.3 });
      } else {
        gsap.to(ring, {
          width: 32,
          height: 32,
          borderColor: "rgba(237,234,227,0.4)",
          backgroundColor: "transparent",
          duration: 0.45,
          ease: "expo.out",
        });
        gsap.to(label, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    };

    const onMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      // Jump into place before fading in, so it never streaks from the corner.
      if (!visible) gsap.set([dot, ring], { x: lastX, y: lastY });
      show();
      dotX(lastX);
      dotY(lastY);
      ringX(lastX);
      ringY(lastY);
    };

    const onOver = (e: PointerEvent) => {
      show();
      applyState(
        ((e.target as HTMLElement)?.closest?.(INTERACTIVE) ??
          null) as HTMLElement | null,
      );
    };

    // Scrolling moves elements under a stationary pointer; browsers don't
    // reliably re-fire pointerover for that, so re-read the hit target here.
    const onScroll = () => {
      if (!visible || lastX < 0) return;
      const el = document.elementFromPoint(lastX, lastY) as HTMLElement | null;
      applyState((el?.closest?.(INTERACTIVE) ?? null) as HTMLElement | null);
    };

    const onDown = () => gsap.to(ring, { scale: 0.82, duration: 0.2 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3 });
    const onEnter = () => show();
    const onLeave = () => hide();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
      gsap.killTweensOf([dot, ring, label]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[9999] ${
        active ? "" : "hidden"
      }`}
    >
      <div
        ref={ringRef}
        className="invisible absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border opacity-0"
        style={{ borderColor: "rgba(237,234,227,0.4)" }}
      >
        <span
          ref={labelRef}
          className="invisible whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        className="invisible absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-bone opacity-0"
      />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import type { Profile } from "@/lib/types";
import Magnetic from "../ui/Magnetic";
import { TextReveal } from "../ui/Reveal";

const HeroScene = dynamic(() => import("../three/HeroScene"), { ssr: false });

export default function Hero({ profile }: { profile: Profile | null }) {
  const name = profile?.name ?? "Shivaprasad Tiwari";
  const headline =
    profile?.headline ?? "Full stack developer — NestJS · FastAPI · React";
  const location = profile?.location ?? "Kathmandu, Nepal";
  const root = useRef<HTMLElement>(null);

  // Everything that isn't split type arrives on the same beat.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-fade]", { opacity: 0, y: 24 });
      introDone.then(() => {
        gsap.to("[data-hero-fade]", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: EASE,
          stagger: 0.08,
          delay: 0.5,
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-28 sm:pb-10"
    >
      {/* The object sits off to the right so it frames the type instead of fighting it. */}
      <div className="pointer-events-none absolute inset-0 md:left-[26%]">
        <HeroScene sectionId="hero" />
      </div>

      {/* Masthead */}
      <div
        data-hero-fade
        className="relative z-10 flex items-baseline justify-between px-6 sm:px-10"
      >
        <span className="label">{name}</span>
        <span className="label hidden sm:block">Selected work — 2026</span>
      </div>

      {/* Statement */}
      <div className="relative z-10 px-6 py-10 sm:px-10">
        <h1 className="display-xl max-w-[15ch] text-bone">
          <TextReveal as="span" className="block" play={introDone} delay={0.1}>
            I build the
          </TextReveal>
          <TextReveal as="span" className="block" play={introDone} delay={0.2}>
            parts users
          </TextReveal>
          <TextReveal as="span" className="block" play={introDone} delay={0.3}>
            <span className="italic text-acid">never see.</span>
          </TextReveal>
        </h1>
      </div>

      {/* Footer row */}
      <div className="relative z-10 px-6 sm:px-10">
        <div
          data-hero-fade
          className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3"
        >
          <Magnetic>
            <Link
              href="/#work"
              className="btn-acid inline-block px-7 py-3 text-sm"
              data-cursor-label="View"
            >
              See the work
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/#contact"
              className="btn-ghost inline-block px-7 py-3 text-sm"
            >
              Get in touch
            </Link>
          </Magnetic>
        </div>

        <div className="rule-t grid gap-4 pt-5 sm:grid-cols-3 sm:items-start">
          <p data-hero-fade className="max-w-sm text-sm text-bone/70">
            {headline}
          </p>
          <p data-hero-fade className="label sm:justify-self-center">
            {location}
          </p>
          <div
            data-hero-fade
            className="flex items-center gap-2 sm:justify-self-end"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-acid" />
            </span>
            <span className="label">Open to opportunities</span>
          </div>
        </div>
      </div>
    </section>
  );
}

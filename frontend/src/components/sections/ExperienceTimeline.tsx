"use client";

import { useEffect, useRef } from "react";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import type { Experience } from "@/lib/types";
import SectionHeading from "../SectionHeading";

/**
 * Dates arrive as free text from the admin panel. Only reformat when the value
 * actually carries a month — turning "2025" into "Jan 2025" would invent
 * precision that isn't in the data.
 */
function formatDate(value?: string) {
  if (!value) return "";
  if (/^\d{4}$/.test(value.trim())) return value.trim();

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export default function ExperienceTimeline({
  experiences,
}: {
  experiences: Experience[];
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !experiences.length) return;

    const ctx = gsap.context(() => {
      // The spine draws itself as you read down the list.
      gsap.fromTo(
        "[data-spine]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: "[data-rows]",
            start: "top 70%",
            end: "bottom 80%",
            scrub: 0.6,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 46,
          duration: 1.1,
          ease: EASE,
          scrollTrigger: { trigger: row, start: "top 88%", once: true },
        });

        // Each marker snaps to full size as its row lands.
        const dot = row.querySelector("[data-dot]");
        if (dot) {
          gsap.from(dot, {
            scale: 0,
            duration: 0.7,
            ease: "back.out(2.4)",
            scrollTrigger: { trigger: row, start: "top 85%", once: true },
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, [experiences.length]);

  if (!experiences.length) return null;

  return (
    <section
      ref={root}
      id="experience"
      className="scroll-mt-24 px-6 py-24 sm:px-10 sm:py-32"
    >
      <SectionHeading
        index="03"
        title="Experience"
        caption="Where the work happened, and what it was built with."
      />

      <div data-rows className="relative mt-16 sm:mt-24">
        {/* Spine */}
        <div className="absolute bottom-0 left-0 top-11 w-px bg-rule">
          <div data-spine className="h-full w-px origin-top bg-acid" />
        </div>

        {experiences.map((exp) => (
          <article
            key={exp.id}
            data-row
            className="group relative border-b border-rule py-10 pl-8 sm:pl-16"
          >
            <span
              data-dot
              className={`absolute left-0 top-11 h-[13px] w-[13px] -translate-x-1/2 rounded-full border ${
                exp.current ? "border-acid bg-acid" : "border-bone/40 bg-ink"
              }`}
            />

            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h3 className="display-md text-bone">
                {exp.role}
                <span className="text-bone-muted"> — {exp.company}</span>
              </h3>
              <p className="label tabular shrink-0">
                {formatDate(exp.startDate)} —{" "}
                {exp.current ? (
                  <span className="text-acid">Present</span>
                ) : (
                  formatDate(exp.endDate)
                )}
              </p>
            </div>

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bone/65">
              {exp.description}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {exp.techStack.map((t) => (
                <li key={t} className="label normal-case tracking-[0.08em]">
                  {t}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { EASE, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { Project } from "@/lib/types";
import SectionHeading from "../SectionHeading";

function Card({ project, index }: { project: Project; index: number }) {
  return (
    <article
      data-card
      className="group relative flex h-full w-[84vw] shrink-0 flex-col justify-between border border-rule p-7 transition-colors duration-500 hover:border-bone/40 sm:w-[52vw] lg:w-[34vw] lg:p-9"
    >
      <div>
        <div className="flex items-start justify-between">
          <span className="label tabular transition-colors duration-500 group-hover:text-acid">
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.featured && (
            <span className="label text-acid">Featured</span>
          )}
        </div>

        <h3 className="display-md mt-10 text-balance text-bone lg:mt-14">
          {project.title}
        </h3>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-bone/65">
          {project.description}
        </p>
      </div>

      <div className="mt-10">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {project.techStack.map((t) => (
            <li key={t} className="label normal-case tracking-[0.08em]">
              {t}
            </li>
          ))}
        </ul>

        <div className="rule-t mt-6 flex gap-8 pt-5">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="link text-sm text-bone"
              data-cursor-label="Visit"
            >
              Live site ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="link text-sm text-bone-muted"
              data-cursor-label="Code"
            >
              Source ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects({
  projects,
  githubUrl,
}: {
  projects: Project[];
  githubUrl?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!projects.length || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    // Horizontal scroll needs room and a pointer; below that it reads as a list.
    mm.add("(min-width: 768px)", () => {
      const el = track.current;
      const container = pin.current;
      if (!el || !container) return;

      const distance = () => el.scrollWidth - window.innerWidth + 80;

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progress.current) {
              progress.current.style.transform = `scaleX(${self.progress})`;
            }
            if (counter.current) {
              const i = Math.min(
                projects.length,
                Math.floor(self.progress * projects.length) + 1,
              );
              counter.current.textContent = String(i).padStart(2, "0");
            }
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      const tweens = cards.map((card) =>
        gsap.from(card, {
          opacity: 0,
          y: 44,
          duration: 1,
          ease: EASE,
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        }),
      );
      return () => tweens.forEach((t) => t.scrollTrigger?.kill());
    });

    ScrollTrigger.refresh();
    return () => mm.revert();
  }, [projects.length]);

  if (!projects.length) return null;

  return (
    <section ref={root} id="work" className="scroll-mt-24 py-24 sm:py-32">
      <div className="px-6 sm:px-10">
        <SectionHeading
          index="04"
          title="Selected work"
          caption="A few things worth showing. Scroll sideways."
        />
      </div>

      {/* Desktop: pinned horizontal run. Mobile: an ordinary vertical stack. */}
      <div ref={pin} className="md:h-screen md:overflow-hidden">
        <div className="flex h-full flex-col justify-center">
          <div
            ref={track}
            className="flex flex-col gap-6 px-6 pt-12 sm:px-10 md:h-[62vh] md:flex-row md:gap-8 md:pt-0"
          >
            {projects.map((p, i) => (
              <Card key={p.id} project={p} index={i} />
            ))}

            {/* Tail card — turns the end of the run into a call to action. */}
            {githubUrl && (
              <div className="flex h-full w-[84vw] shrink-0 flex-col justify-end border border-transparent p-7 sm:w-[40vw] lg:w-[26vw] lg:p-9">
                <p className="display-md text-bone-muted">
                  More on
                  <br />
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-acid"
                    data-cursor-label="GitHub"
                  >
                    GitHub ↗
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Progress readout */}
          <div className="hidden items-center gap-6 px-10 pt-12 md:flex">
            <div className="h-px flex-1 bg-rule">
              <div
                ref={progress}
                className="h-px origin-left scale-x-0 bg-acid"
              />
            </div>
            <span className="label tabular">
              <span ref={counter}>01</span> / {String(projects.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

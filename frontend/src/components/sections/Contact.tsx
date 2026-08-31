"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import SectionHeading from "../SectionHeading";
import Magnetic from "../ui/Magnetic";
import { Rise, TextReveal } from "../ui/Reveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function Contact({ profile }: { profile: Profile | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const socials = [
    { label: "GitHub", href: profile?.githubUrl },
    { label: "LinkedIn", href: profile?.linkedinUrl },
    { label: "Twitter", href: profile?.twitterUrl },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <section id="contact" className="scroll-mt-24 px-6 py-24 sm:px-10 sm:py-32">
      <SectionHeading
        index="06"
        title="Contact"
        caption="Roles, freelance work, or a question about something above."
      />

      <TextReveal
        as="h3"
        className="display-lg mt-16 max-w-[13ch] text-bone sm:mt-24"
      >
        Let&apos;s build something that outlives the demo.
      </TextReveal>

      <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
        {/* Direct routes first — a form is the slower option for most people. */}
        <Rise>
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="group block"
              data-cursor-label="Email"
            >
              <span className="label">Write to me</span>
              <span className="mt-3 block break-all font-display text-2xl text-bone transition-colors duration-500 group-hover:text-acid sm:text-3xl">
                {profile.email}
              </span>
            </a>
          )}

          <ul className="mt-14">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-baseline justify-between border-t border-rule py-4"
                  data-cursor
                >
                  <span className="text-sm text-bone">{s.label}</span>
                  <span className="label transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid">
                    ↗
                  </span>
                </a>
              </li>
            ))}
            <li className="border-t border-rule" />
          </ul>
        </Rise>

        <Rise delay={0.1}>
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-6">
              <input
                name="name"
                required
                maxLength={120}
                placeholder="Name"
                className="field"
                aria-label="Your name"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="field"
                aria-label="Your email"
              />
            </div>
            <input
              name="subject"
              maxLength={200}
              placeholder="Subject (optional)"
              className="field"
              aria-label="Subject"
            />
            <textarea
              name="body"
              required
              maxLength={5000}
              rows={4}
              placeholder="Message"
              className="field"
              aria-label="Message"
            />

            <div className="mt-8 flex items-center gap-6">
              <Magnetic strength={0.25}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-acid px-8 py-3.5 text-sm disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </Magnetic>

              <p aria-live="polite" className="label">
                {status === "sent" && (
                  <span className="text-acid">Sent — I&apos;ll reply soon.</span>
                )}
                {status === "error" && (
                  <span className="text-bone">
                    Didn&apos;t send. Email me directly.
                  </span>
                )}
              </p>
            </div>
          </form>
        </Rise>
      </div>
    </section>
  );
}

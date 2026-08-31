import Link from "next/link";

export default function Footer({ name }: { name: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className="rule-t mt-8 overflow-hidden px-6 pb-8 pt-12 sm:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <p className="label max-w-xs leading-relaxed">
          Built with Next.js, Three.js, GSAP and NestJS. Type set in Instrument
          Serif and Inter Tight.
        </p>

        <div className="flex items-baseline gap-8">
          <Link href="/blog" className="link text-sm text-bone" data-cursor>
            Writing
          </Link>
          <a href="#hero" className="link text-sm text-bone" data-cursor>
            Back to top ↑
          </a>
        </div>
      </div>

      {/* Wordmark — set large enough to sit on the baseline of the page. */}
      <p
        aria-hidden
        className="mt-16 select-none whitespace-nowrap font-display leading-[0.78] text-bone/[0.07]"
        style={{ fontSize: "clamp(3rem, 15.5vw, 18rem)" }}
      >
        {name}
      </p>

      <div className="rule-t flex flex-wrap items-baseline justify-between gap-4 pt-5">
        <span className="label">
          © {year} {name}
        </span>
        <span className="label">All rights reserved</span>
      </div>
    </footer>
  );
}

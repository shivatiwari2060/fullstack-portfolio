import type { Skill } from "@/lib/types";
import SectionHeading from "../SectionHeading";
import Marquee from "../ui/Marquee";

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Data",
  devops: "Infra & Tools",
  ai_ml: "AI / ML",
  other: "Other",
};

const ORDER = ["backend", "frontend", "database", "devops", "ai_ml", "other"];

export default function Skills({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  if (!categories.length) return null;

  return (
    <section id="stack" className="scroll-mt-24 py-24 sm:py-32">
      <div className="px-6 sm:px-10">
        <SectionHeading
          index="02"
          title="Stack"
          caption="Tools I reach for first. The list is short on purpose."
        />
      </div>

      <div className="mt-16 sm:mt-24">
        {categories.map((category, i) => (
          <div
            key={category}
            className="rule-t grid grid-cols-1 items-center gap-2 py-7 sm:grid-cols-[220px_1fr] sm:gap-0"
          >
            <div className="flex items-baseline gap-3 px-6 sm:px-10">
              <span className="label">
                {CATEGORY_LABELS[category] ?? category}
              </span>
              <span className="label tabular opacity-50">
                {String(grouped[category].length).padStart(2, "0")}
              </span>
            </div>

            <Marquee reverse={i % 2 === 1} speed={44 + i * 6}>
              {grouped[category].map((s) => (
                <span
                  key={s.id}
                  className="flex shrink-0 items-center whitespace-nowrap"
                >
                  <span className="display-md px-5 text-bone/85 transition-colors duration-300 hover:text-acid sm:px-7">
                    {s.name}
                  </span>
                  <span className="h-1 w-1 shrink-0 rounded-full bg-acid/60" />
                </span>
              ))}
            </Marquee>
          </div>
        ))}
        <div className="rule-t" />
      </div>
    </section>
  );
}

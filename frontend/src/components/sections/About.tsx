import type { Experience, Profile } from "@/lib/types";
import SectionHeading from "../SectionHeading";
import { Rise, ScrubWords } from "../ui/Reveal";

/** Facts beat adjectives — pull what we can straight from the data. */
function buildFacts(profile: Profile | null, experiences: Experience[]) {
  const current = experiences.find((e) => e.current);
  const stacks = new Set(experiences.flatMap((e) => e.techStack)).size;

  const facts: { key: string; value: string; href?: string }[] = [];

  if (current) {
    facts.push({ key: "Currently", value: `${current.role} @ ${current.company}` });
  }
  if (profile?.location) facts.push({ key: "Based in", value: profile.location });
  if (experiences.length) {
    facts.push({
      key: "Roles held",
      value: String(experiences.length).padStart(2, "0"),
    });
  }
  if (stacks) {
    facts.push({
      key: "Technologies shipped",
      value: String(stacks).padStart(2, "0"),
    });
  }
  if (profile?.email) {
    facts.push({ key: "Email", value: profile.email, href: `mailto:${profile.email}` });
  }

  return facts;
}

export default function About({
  profile,
  experiences,
}: {
  profile: Profile | null;
  experiences: Experience[];
}) {
  const statement =
    profile?.about ??
    "I work on the layer most people never notice — the APIs, the data models, the jobs that run at three in the morning. When it is done right, the interface just feels fast.";

  const facts = buildFacts(profile, experiences);

  return (
    <section id="about" className="scroll-mt-24 px-6 py-24 sm:px-10 sm:py-32">
      <SectionHeading
        index="01"
        title="About"
        caption="Backend-leaning full stack. Comfortable across the whole request."
      />

      <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-[1.55fr_1fr] lg:gap-24">
        <ScrubWords
          text={statement}
          className="display-md max-w-[22ch] text-balance text-bone"
        />

        <Rise className="lg:pt-3">
          <dl>
            {facts.map((f) => (
              <div
                key={f.key}
                className="rule-t flex items-baseline justify-between gap-6 py-4"
              >
                <dt className="label shrink-0">{f.key}</dt>
                <dd className="text-right text-sm text-bone">
                  {f.href ? (
                    <a href={f.href} className="link" data-cursor>
                      {f.value}
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Rise>
      </div>
    </section>
  );
}

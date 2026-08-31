import { Rise } from "./ui/Reveal";

/**
 * Every section opens the same way: a hairline, an index, a name, and an
 * optional right-hand caption. That repetition is what makes a layout look
 * art-directed rather than assembled.
 */
export default function SectionHeading({
  index,
  title,
  caption,
}: {
  index: string;
  title: string;
  caption?: string;
}) {
  return (
    <Rise className="rule-t flex flex-wrap items-baseline justify-between gap-4 pt-5">
      <div className="flex items-baseline gap-5">
        <span className="label tabular">({index})</span>
        <h2 className="text-lg font-medium tracking-tight text-bone">{title}</h2>
      </div>
      {caption && (
        <p className="max-w-xs font-mono text-[11px] leading-relaxed text-bone-muted sm:text-right">
          {caption}
        </p>
      )}
    </Rise>
  );
}

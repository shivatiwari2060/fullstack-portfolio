import Link from "next/link";
import type { Blog } from "@/lib/types";
import SectionHeading from "../SectionHeading";
import { Rise } from "../ui/Reveal";

export function PostRow({ post, index }: { post: Blog; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 border-b border-rule py-7 sm:flex-row sm:items-baseline sm:gap-10"
      data-cursor-label="Read"
    >
      <span className="label tabular shrink-0 sm:w-16">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex-1">
        <h3 className="display-md text-bone transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:text-acid">
          {post.title}
        </h3>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone/60">
          {post.excerpt}
        </p>
      </div>

      <div className="flex shrink-0 items-baseline gap-6 sm:flex-col sm:items-end sm:gap-2">
        <span className="label tabular">
          {new Date(post.createdAt).toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
          })}
        </span>
        {post.tags.length > 0 && (
          <span className="label opacity-60">{post.tags[0]}</span>
        )}
      </div>
    </Link>
  );
}

export default function BlogPreview({ blogs }: { blogs: Blog[] }) {
  if (!blogs.length) return null;

  return (
    <section id="writing" className="scroll-mt-24 px-6 py-24 sm:px-10 sm:py-32">
      <SectionHeading
        index="05"
        title="Writing"
        caption="Notes from building things — mostly backend, occasionally opinionated."
      />

      <Rise className="mt-16 sm:mt-24">
        <div className="rule-t">
          {blogs.slice(0, 3).map((b, i) => (
            <PostRow key={b.id} post={b} index={i} />
          ))}
        </div>

        <Link
          href="/blog"
          className="link mt-10 inline-block text-sm text-bone"
          data-cursor
        >
          All posts ({String(blogs.length).padStart(2, "0")}) →
        </Link>
      </Rise>
    </section>
  );
}

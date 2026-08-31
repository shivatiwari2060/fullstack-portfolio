import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { TextReveal } from "@/components/ui/Reveal";
import { getBlogBySlug, getProfile } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Post not found" };
  return {
    title: `${blog.title} — Shivaprasad Tiwari`,
    description: blog.excerpt,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const [blog, profile] = await Promise.all([getBlogBySlug(slug), getProfile()]);
  if (!blog) notFound();

  const date = new Date(blog.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      <article className="flex-1 px-6 pb-24 pt-36 sm:px-10 sm:pt-44">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rule-t flex flex-wrap items-baseline justify-between gap-4 pt-5">
            <Link href="/blog" className="link text-sm text-bone" data-cursor>
              ← Index
            </Link>
            <span className="label tabular">{date}</span>
          </div>

          <TextReveal
            as="h1"
            className="display-lg mt-14 text-balance text-bone"
          >
            {blog.title}
          </TextReveal>

          {blog.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2">
              {blog.tags.map((t) => (
                <li key={t} className="label normal-case tracking-[0.08em]">
                  {t}
                </li>
              ))}
            </ul>
          )}

          <div className="prose-blog rule-t mt-12 pt-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content ?? ""}
            </ReactMarkdown>
          </div>

          <div className="rule-t mt-20 pt-5">
            <Link href="/blog" className="link text-sm text-bone" data-cursor>
              ← All posts
            </Link>
          </div>
        </div>
      </article>

      <Footer name={profile?.name ?? "Shivaprasad Tiwari"} />
    </main>
  );
}

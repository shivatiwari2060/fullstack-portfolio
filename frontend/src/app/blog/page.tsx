import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PostRow } from "@/components/sections/BlogPreview";
import { Rise, TextReveal } from "@/components/ui/Reveal";
import { getBlogs, getProfile } from "@/lib/api";

export const metadata: Metadata = {
  title: "Writing — Shivaprasad Tiwari",
  description:
    "Notes on NestJS, FastAPI, React, and building full stack products.",
};

export default async function BlogIndex() {
  const [blogs, profile] = await Promise.all([getBlogs(), getProfile()]);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1 px-6 pb-24 pt-36 sm:px-10 sm:pt-44">
        <div className="rule-t flex flex-wrap items-baseline justify-between gap-4 pt-5">
          <span className="label">Index</span>
          <span className="label tabular">
            {String(blogs.length).padStart(2, "0")} posts
          </span>
        </div>

        <TextReveal as="h1" className="display-lg mt-14 max-w-[14ch] text-bone">
          Notes from the back end.
        </TextReveal>

        <Rise className="mt-20">
          {blogs.length === 0 ? (
            <p className="rule-t py-8 text-bone/60">
              Nothing published yet — check back soon.
            </p>
          ) : (
            <div className="rule-t">
              {blogs.map((b, i) => (
                <PostRow key={b.id} post={b} index={i} />
              ))}
            </div>
          )}
        </Rise>
      </div>

      <Footer name={profile?.name ?? "Shivaprasad Tiwari"} />
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import type { Blog, ContactMessage, Experience, Project, Skill } from "@/lib/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<
    { label: string; value: number; href: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const [experiences, projects, skills, blogs, messages] =
          await Promise.all([
            api<Experience[]>("/experiences"),
            api<Project[]>("/projects"),
            api<Skill[]>("/skills"),
            api<Blog[]>("/blogs/all"),
            api<ContactMessage[]>("/messages"),
          ]);
        setStats([
          { label: "Experiences", value: experiences.length, href: "/admin/experiences" },
          { label: "Projects", value: projects.length, href: "/admin/projects" },
          { label: "Skills", value: skills.length, href: "/admin/skills" },
          { label: "Blog posts", value: blogs.length, href: "/admin/blogs" },
          {
            label: "Unread messages",
            value: messages.filter((m) => !m.read).length,
            href: "/admin/messages",
          },
        ]);
      } catch {
        /* 401 redirect handled by api() */
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-foreground/60">
        Manage everything that appears on your portfolio.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="glass rounded-2xl p-6 transition hover:border-violet-400/50">
              <p className="text-4xl font-bold gradient-text">{s.value}</p>
              <p className="mt-2 text-sm text-foreground/60">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/adminApi";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/experiences", label: "Experience" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/blogs", label: "Blog posts" },
  { href: "/admin/messages", label: "Messages" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [isLogin, router]);

  if (!ready) return null;
  if (isLogin) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-white/10 bg-white/[0.03] p-5">
        <Link href="/admin" className="font-mono text-lg font-bold gradient-text">
          Admin
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-violet-500/20 text-violet-200"
                    : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
          <Link
            href="/"
            className="block text-foreground/60 hover:text-cyan-300"
          >
            ← View site
          </Link>
          <button
            onClick={() => {
              clearToken();
              router.replace("/admin/login");
            }}
            className="text-rose-400/80 hover:text-rose-300"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="ml-56 w-full p-8">{children}</main>
    </div>
  );
}

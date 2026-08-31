"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/admin/ui";
import { api } from "@/lib/adminApi";
import type { ContactMessage } from "@/lib/types";

export default function AdminMessages() {
  const [items, setItems] = useState<ContactMessage[]>([]);

  const load = useCallback(() => {
    api<ContactMessage[]>("/messages").then(setItems).catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function markRead(id: string) {
    await api(`/messages/${id}/read`, { method: "PATCH" });
    load();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await api(`/messages/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Messages</h1>
      <p className="mt-2 text-foreground/60">
        Submissions from the contact form.
      </p>
      <div className="mt-8 space-y-4">
        {items.length === 0 && (
          <p className="text-foreground/50">No messages yet.</p>
        )}
        {items.map((m) => (
          <div
            key={m.id}
            className={`glass rounded-2xl p-5 ${
              m.read ? "opacity-60" : "border-cyan-400/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {m.name}{" "}
                  <a
                    href={`mailto:${m.email}`}
                    className="ml-1 font-mono text-xs text-cyan-300 hover:underline"
                  >
                    {m.email}
                  </a>
                </h3>
                {m.subject && (
                  <p className="mt-1 text-sm font-medium text-foreground/80">
                    {m.subject}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/70">
                  {m.body}
                </p>
                <p className="mt-2 font-mono text-xs text-foreground/40">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {!m.read && (
                  <Button variant="ghost" onClick={() => markRead(m.id)}>
                    Mark read
                  </Button>
                )}
                <Button variant="danger" onClick={() => onDelete(m.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

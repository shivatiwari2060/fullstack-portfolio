"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Field, Input, Toast } from "@/components/admin/ui";
import { api } from "@/lib/adminApi";
import type { Skill } from "@/lib/types";

const categories = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Data" },
  { value: "devops", label: "Infra & Tools" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "other", label: "Other" },
];

const categoryLabel = (value: string) =>
  categories.find((c) => c.value === value)?.label ?? value;

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    api<Skill[]>("/skills").then(setItems).catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await api("/skills", {
        method: "POST",
        body: JSON.stringify({
          name: fd.get("name") as string,
          category: fd.get("category") as string,
          level: Number(fd.get("level") ?? 80),
        }),
      });
      setMessage("Skill added.");
      form.reset();
      load();
    } catch (err) {
      setMessage(err instanceof Error ? `Failed: ${err.message}` : "Failed");
    }
  }

  async function onDelete(id: string) {
    await api(`/skills/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = items.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Skills</h1>
      <form
        onSubmit={onSubmit}
        className="glass mt-6 flex flex-wrap items-end gap-4 rounded-2xl p-6"
      >
        <div className="min-w-40 flex-1">
          <Field label="Skill name">
            <Input name="name" required placeholder="e.g. GraphQL" />
          </Field>
        </div>
        <div>
          <Field label="Category">
            <select
              name="category"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-violet-400/70 [&>option]:bg-[#14102a]"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="w-28">
          <Field label="Level (0–100)">
            <Input name="level" type="number" min={0} max={100} defaultValue={80} />
          </Field>
        </div>
        <Button type="submit">Add</Button>
      </form>
      <Toast message={message} />

      <div className="mt-8 space-y-6">
        {Object.entries(grouped).map(([category, skills]) => (
          <div key={category}>
            <h3 className="font-mono text-sm uppercase tracking-widest text-cyan-300/70">
              {categoryLabel(category)}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="group flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm"
                >
                  {s.name}
                  <button
                    onClick={() => onDelete(s.id)}
                    className="text-foreground/40 transition hover:text-rose-400"
                    title="Remove"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

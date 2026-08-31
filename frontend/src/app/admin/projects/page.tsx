"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Field,
  Input,
  parseList,
  TextArea,
  Toast,
} from "@/components/admin/ui";
import { api } from "@/lib/adminApi";
import type { Project } from "@/lib/types";

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    api<Project[]>("/projects").then(setItems).catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      techStack: parseList(fd.get("techStack") as string),
      githubUrl: (fd.get("githubUrl") as string) || undefined,
      liveUrl: (fd.get("liveUrl") as string) || undefined,
      imageUrl: (fd.get("imageUrl") as string) || undefined,
      featured: fd.get("featured") === "on",
      sortOrder: Number(fd.get("sortOrder") ?? 0),
    };
    try {
      if (editing) {
        await api(`/projects/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/projects", { method: "POST", body: JSON.stringify(payload) });
      }
      setMessage("Saved.");
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? `Failed: ${err.message}` : "Failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await api(`/projects/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add project
        </Button>
      </div>
      <Toast message={message} />

      {(showForm || editing) && (
        <form
          onSubmit={onSubmit}
          className="glass mt-6 space-y-4 rounded-2xl p-6"
          key={editing?.id ?? "new"}
        >
          <Field label="Title">
            <Input name="title" required defaultValue={editing?.title} />
          </Field>
          <Field label="Description">
            <TextArea
              name="description"
              rows={4}
              required
              defaultValue={editing?.description}
            />
          </Field>
          <Field label="Tech stack (comma separated)">
            <Input name="techStack" defaultValue={editing?.techStack.join(", ")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="GitHub URL">
              <Input name="githubUrl" defaultValue={editing?.githubUrl} />
            </Field>
            <Field label="Live URL">
              <Input name="liveUrl" defaultValue={editing?.liveUrl} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image URL">
              <Input name="imageUrl" defaultValue={editing?.imageUrl} />
            </Field>
            <Field label="Sort order">
              <Input
                name="sortOrder"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={editing?.featured}
            />
            Featured (spans full width)
          </label>
          <div className="flex gap-3">
            <Button type="submit">{editing ? "Update" : "Create"}</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {items.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {p.title}{" "}
                  {p.featured && (
                    <span className="ml-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                      featured
                    </span>
                  )}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-foreground/60">
                  {p.description}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(p.id)}>
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

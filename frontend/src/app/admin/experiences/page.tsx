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
import type { Experience } from "@/lib/types";

export default function AdminExperiences() {
  const [items, setItems] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    api<Experience[]>("/experiences").then(setItems).catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      company: fd.get("company") as string,
      role: fd.get("role") as string,
      description: fd.get("description") as string,
      techStack: parseList(fd.get("techStack") as string),
      startDate: fd.get("startDate") as string,
      endDate: (fd.get("endDate") as string) || undefined,
      current: fd.get("current") === "on",
      sortOrder: Number(fd.get("sortOrder") ?? 0),
    };
    try {
      if (editing) {
        await api(`/experiences/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/experiences", {
          method: "POST",
          body: JSON.stringify(payload),
        });
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
    if (!confirm("Delete this experience?")) return;
    await api(`/experiences/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Experience</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add experience
        </Button>
      </div>
      <Toast message={message} />

      {(showForm || editing) && (
        <form
          onSubmit={onSubmit}
          className="glass mt-6 space-y-4 rounded-2xl p-6"
          key={editing?.id ?? "new"}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company">
              <Input name="company" required defaultValue={editing?.company} />
            </Field>
            <Field label="Role">
              <Input name="role" required defaultValue={editing?.role} />
            </Field>
          </div>
          <Field label="Description">
            <TextArea
              name="description"
              rows={4}
              required
              defaultValue={editing?.description}
            />
          </Field>
          <Field label="Tech stack (comma separated)">
            <Input
              name="techStack"
              defaultValue={editing?.techStack.join(", ")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Start (e.g. 2023)">
              <Input name="startDate" required defaultValue={editing?.startDate} />
            </Field>
            <Field label="End (blank if current)">
              <Input name="endDate" defaultValue={editing?.endDate} />
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
              name="current"
              defaultChecked={editing?.current}
            />
            I currently work here
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
        {items.map((exp) => (
          <div key={exp.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {exp.role} @ {exp.company}
                </h3>
                <p className="font-mono text-xs text-foreground/50">
                  {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(exp);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(exp.id)}>
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

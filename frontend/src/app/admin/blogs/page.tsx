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
import type { Blog } from "@/lib/types";

export default function AdminBlogs() {
  const [items, setItems] = useState<Blog[]>([]);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    api<Blog[]>("/blogs/all").then(setItems).catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      slug: (fd.get("slug") as string) || undefined,
      excerpt: fd.get("excerpt") as string,
      content: fd.get("content") as string,
      coverImage: (fd.get("coverImage") as string) || undefined,
      tags: parseList(fd.get("tags") as string),
      published: fd.get("published") === "on",
    };
    try {
      if (editing) {
        await api(`/blogs/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/blogs", { method: "POST", body: JSON.stringify(payload) });
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
    if (!confirm("Delete this post permanently?")) return;
    await api(`/blogs/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePublish(blog: Blog) {
    await api(`/blogs/${blog.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !blog.published }),
    });
    load();
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog posts</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + New post
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
            <Field label="Title">
              <Input name="title" required defaultValue={editing?.title} />
            </Field>
            <Field label="Slug (auto-generated if blank)">
              <Input name="slug" defaultValue={editing?.slug} />
            </Field>
          </div>
          <Field label="Excerpt (shown on cards and in search results)">
            <TextArea
              name="excerpt"
              rows={2}
              required
              defaultValue={editing?.excerpt}
            />
          </Field>
          <Field label="Content (Markdown)">
            <TextArea
              name="content"
              rows={16}
              required
              defaultValue={editing?.content}
              className="font-mono"
              placeholder={"# Heading\n\nWrite your post in **markdown**…"}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cover image URL (optional)">
              <Input name="coverImage" defaultValue={editing?.coverImage} />
            </Field>
            <Field label="Tags (comma separated)">
              <Input name="tags" defaultValue={editing?.tags.join(", ")} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editing?.published}
            />
            Published (visible on the public site)
          </label>
          <div className="flex gap-3">
            <Button type="submit">{editing ? "Update post" : "Create post"}</Button>
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
        {items.map((b) => (
          <div key={b.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {b.title}{" "}
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                      b.published
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {b.published ? "published" : "draft"}
                  </span>
                </h3>
                <p className="mt-1 font-mono text-xs text-foreground/50">
                  /blog/{b.slug} ·{" "}
                  {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" onClick={() => togglePublish(b)}>
                  {b.published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const full = await api<Blog>(`/blogs/${b.id}`);
                    setEditing(full);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(b.id)}>
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

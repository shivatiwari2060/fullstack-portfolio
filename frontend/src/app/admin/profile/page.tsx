"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, TextArea, Toast } from "@/components/admin/ui";
import { api } from "@/lib/adminApi";
import type { Profile } from "@/lib/types";

const fields: Array<{ key: keyof Profile; label: string; textarea?: boolean }> =
  [
    { key: "name", label: "Name" },
    { key: "headline", label: "Headline" },
    { key: "about", label: "About", textarea: true },
    { key: "email", label: "Contact email" },
    { key: "location", label: "Location" },
    { key: "githubUrl", label: "GitHub URL" },
    { key: "linkedinUrl", label: "LinkedIn URL" },
    { key: "twitterUrl", label: "Twitter/X URL" },
    { key: "resumeUrl", label: "Resume URL" },
  ];

export default function AdminProfile() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Profile>("/profile").then(setProfile).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const updated = await api<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setProfile(updated);
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err instanceof Error ? `Failed: ${err.message}` : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-foreground/60">
        This powers the hero, about, and contact sections.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            {f.textarea ? (
              <TextArea
                name={f.key}
                rows={5}
                defaultValue={(profile[f.key] as string) ?? ""}
                key={`${f.key}-${profile.id ?? "new"}`}
              />
            ) : (
              <Input
                name={f.key}
                defaultValue={(profile[f.key] as string) ?? ""}
                key={`${f.key}-${profile.id ?? "new"}`}
              />
            )}
          </Field>
        ))}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        <Toast message={message} />
      </form>
    </div>
  );
}

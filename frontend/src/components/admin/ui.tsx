"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const base =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400/70";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-foreground/50">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${base} ${props.className ?? ""}`} />
  );
}

export function Button({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90",
    ghost: "border border-white/15 text-foreground/80 hover:bg-white/5",
    danger: "border border-rose-500/40 text-rose-300 hover:bg-rose-500/10",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  const isError = message.toLowerCase().includes("fail");
  return (
    <p
      className={`mt-3 text-sm ${isError ? "text-rose-400" : "text-emerald-400"}`}
    >
      {message}
    </p>
  );
}

/** Parse a comma-separated input into a clean string array. */
export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

const REPO = "https://github.com/vedantnimbarte/dlm";

// Report a bug → GitHub's prefilled new-issue flow. No backend, no token: the
// form builds an issues/new URL and the reporter submits it under their own
// GitHub account, so the issue lands in the dlm repo with a `bug` label.
function buildIssueUrl(f: {
  title: string;
  description: string;
  steps: string;
  expected: string;
  os: string;
  version: string;
  command: string;
}) {
  const body = [
    "### What happened",
    f.description.trim() || "_(describe the bug)_",
    "",
    "### Steps to reproduce",
    f.steps.trim() || "_(list the steps)_",
    "",
    "### Expected behavior",
    f.expected.trim() || "_(what you expected)_",
    "",
    "### Environment",
    `- OS: ${f.os.trim() || "—"}`,
    `- dlm version: ${f.version.trim() || "—"}`,
    f.command.trim() ? `- Command: \`${f.command.trim()}\`` : "- Command: —",
    "",
    "---",
    "_Filed from the dlm website._",
  ].join("\n");

  const params = new URLSearchParams({
    labels: "bug",
    title: f.title.trim(),
    body,
  });
  return `${REPO}/issues/new?${params.toString()}`;
}

function detectOS(): string {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Linux|X11/i.test(ua)) return "Linux";
  return "";
}

export function ReportBug({
  className = "",
  label = "Report a bug",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [os, setOs] = useState("");
  const [version, setVersion] = useState("");
  const [command, setCommand] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  // Prefill OS once, on open.
  useEffect(() => {
    if (open && !os) setOs(detectOS());
  }, [open, os]);

  // Focus the first field on open; Escape closes; restore focus on close.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => titleRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const url = buildIssueUrl({
      title,
      description,
      steps,
      expected,
      os,
      version,
      command,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    close();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="glass glass-strong my-auto w-full max-w-lg rounded-card p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={headingId}
                  className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-text"
                >
                  Report a bug
                </h2>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-text-muted">
                  This opens a prefilled issue on GitHub — review and submit it
                  there to file it in the dlm repo.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 rounded-[6px] border border-glass-border px-2 py-1 text-text-muted transition-colors hover:text-text"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <Field label="Title" required>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of the bug"
                  className={inputCls}
                  required
                />
              </Field>

              <Field label="What happened" required>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the bug and what you saw"
                  rows={3}
                  className={inputCls}
                  required
                />
              </Field>

              <Field label="Steps to reproduce">
                <textarea
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder={"1. …\n2. …"}
                  rows={2}
                  className={inputCls}
                />
              </Field>

              <Field label="Expected behavior">
                <input
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  placeholder="What you expected to happen"
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="OS">
                  <input
                    value={os}
                    onChange={(e) => setOs(e.target.value)}
                    placeholder="Linux"
                    className={inputCls}
                  />
                </Field>
                <Field label="dlm version">
                  <input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v0.1.0"
                    className={inputCls}
                  />
                </Field>
                <Field label="Command">
                  <input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="dlm serve …"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="btn-secondary h-10 text-[0.875rem]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-primary h-10 text-[0.875rem] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open on GitHub ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-glass-border bg-white/[0.04] px-3 py-2 text-[0.875rem] text-text placeholder:text-text-muted/70 focus:border-accent-stream/50 focus:outline-none focus:ring-1 focus:ring-accent-stream/40";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[0.72rem] font-medium uppercase tracking-eyebrow text-text-muted">
        {label}
        {required ? (
          <span className="text-accent-stream" aria-hidden>
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

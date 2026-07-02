"use client";

import { useState } from "react";

interface Line {
  text: string;
  tone?: "muted" | "stream" | "compute" | "pinned" | "text";
}

export function TerminalBlock({
  command,
  lines,
  caption,
}: {
  command: string;
  lines: Line[];
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const toneClass = (t?: Line["tone"]) =>
    t === "stream"
      ? "text-accent-stream"
      : t === "compute"
        ? "text-accent-compute"
        : t === "pinned"
          ? "text-accent-pinned"
          : t === "text"
            ? "text-text"
            : "text-text-muted";

  return (
    <figure className="overflow-hidden rounded-card border border-border bg-surface-2">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-compute/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-stream/60" />
          <span className="ml-2 font-mono text-[0.7rem] text-text-muted">
            flip — profiler
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-[4px] border border-border bg-surface px-2 py-1 font-mono text-[0.68rem] text-text-muted transition-colors hover:border-text-muted/50 hover:text-text"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed">
        <code>
          <span className="text-accent-stream">$ </span>
          <span className="text-text">{command}</span>
          {"\n"}
          {lines.map((l, i) => (
            <span key={i} className={toneClass(l.tone)}>
              {l.text}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
      {caption ? (
        <figcaption className="border-t border-border px-4 py-2.5 text-[0.72rem] text-text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

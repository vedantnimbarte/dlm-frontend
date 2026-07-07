"use client";

import { useState } from "react";

// A single copy-to-clipboard shell command — lighter than TerminalBlock, for
// the install steps where there's no output to show, just a line to run.
export function CopyCommand({
  command,
  prompt = "$",
}: {
  command: string;
  prompt?: string;
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

  return (
    <div className="glass flex items-center gap-3 rounded-[8px] px-3.5 py-2.5">
      <span className="select-none font-mono text-[0.8rem] text-accent-stream">
        {prompt}
      </span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[0.8rem] text-text">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-[4px] border border-glass-border bg-white/5 px-2 py-1 font-mono text-[0.68rem] text-text-muted transition-colors hover:border-text-muted/50 hover:text-text"
        aria-label={`Copy: ${command}`}
      >
        {copied ? "copied ✓" : "copy"}
      </button>
    </div>
  );
}

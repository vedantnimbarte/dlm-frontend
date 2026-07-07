"use client";

import { useEffect, useState } from "react";

// Auto-typing terminal that cycles the core flow. A live substitute for a
// recorded asciinema — no external asset. Falls back to a static render under
// reduced-motion.
const SCRIPT: { cmd: string; out: string[] }[] = [
  {
    cmd: "dlm pull Qwen/Qwen2.5-0.5B-Instruct",
    out: ["✓ downloaded → ./models/Qwen2.5-0.5B-Instruct"],
  },
  {
    cmd: "dlm serve --model-path ./models/Qwen2.5-0.5B-Instruct",
    out: ["listening on http://127.0.0.1:8000  ·  batching on"],
  },
  {
    cmd: 'curl :8000/v1/chat/completions -d \'{"messages":[…]}\'',
    out: ['{"content":"Hello! How can I help?"}'],
  },
];

export function TerminalDemo() {
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showOut, setShowOut] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (reduced) return;
    const cmd = SCRIPT[step].cmd;
    let t: number;
    if (typed < cmd.length) {
      t = window.setTimeout(() => setTyped((n) => n + 1), 42);
    } else if (!showOut) {
      t = window.setTimeout(() => setShowOut(true), 420);
    } else {
      t = window.setTimeout(() => {
        setStep((s) => (s + 1) % SCRIPT.length);
        setTyped(0);
        setShowOut(false);
      }, 1900);
    }
    return () => window.clearTimeout(t);
  }, [reduced, step, typed, showOut]);

  return (
    <figure className="glass glass-interactive overflow-hidden rounded-card">
      <div className="flex items-center gap-1.5 border-b border-glass-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-compute/60" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-stream/60" aria-hidden />
        <span className="ml-2 font-mono text-[0.7rem] text-text-muted">
          dlm — quickstart
        </span>
      </div>
      <pre className="min-h-[132px] overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed">
        <code>
          {reduced
            ? SCRIPT.map((s, i) => (
                <span key={i}>
                  <span className="text-accent-stream">$ </span>
                  <span className="text-text">{s.cmd}</span>
                  {"\n"}
                  <span className="text-text-muted">{s.out.join("\n")}</span>
                  {"\n"}
                </span>
              ))
            : (
                <>
                  <span className="text-accent-stream">$ </span>
                  <span className="text-text">
                    {SCRIPT[step].cmd.slice(0, typed)}
                  </span>
                  {!showOut ? (
                    <span className="animate-pulse text-text">▋</span>
                  ) : null}
                  {"\n"}
                  {showOut ? (
                    <span className="text-text-muted">
                      {SCRIPT[step].out.join("\n")}
                    </span>
                  ) : null}
                </>
              )}
        </code>
      </pre>
    </figure>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CopyCommand } from "./CopyCommand";

interface Model {
  id: string;
  downloads: number;
  likes: number;
  pipeline_tag: string | null;
  safetensors: boolean;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ModelsBrowser() {
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  // Provider chips, derived from the top models the hub returns (not static).
  const [providers, setProviders] = useState<string[]>([]);

  // Debounced search, with stale-response cancellation.
  useEffect(() => {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      setStatus("loading");
      fetch(`/api/hf-models?q=${encodeURIComponent(query.trim())}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const list: Model[] = Array.isArray(d.models) ? d.models : [];
          setModels(list);
          setStatus("idle");
          // Seed the chips once, from the top providers the hub returns.
          setProviders((prev) =>
            prev.length
              ? prev
              : [...new Set(list.map((m) => m.id.split("/")[0]))].slice(0, 6)
          );
        })
        .catch((e) => {
          if (e?.name !== "AbortError") setStatus("error");
        });
    }, 300);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [query]);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* Search */}
      <div className="glass flex items-center gap-2.5 rounded-card px-4 py-3">
        <span className="text-text-muted" aria-hidden>
          ⌕
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Hugging Face models…"
          aria-label="Search Hugging Face models"
          className="flex-1 bg-transparent text-[0.95rem] text-text placeholder:text-text-muted/70 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-text-muted transition-colors hover:text-text"
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* Provider chips — top authors from the hub */}
      {providers.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {providers.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setQuery(c)}
              className="rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 font-mono text-[0.72rem] text-text-muted transition-colors hover:border-text-muted/50 hover:text-text"
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {/* Results */}
      <div className="mt-8" aria-live="polite">
        {status === "loading" ? (
          <p className="text-[0.9rem] text-text-muted">Searching the hub…</p>
        ) : status === "error" ? (
          <div className="glass rounded-card p-6">
            <p className="text-[0.9rem] text-text">
              Couldn&rsquo;t reach the Hugging Face hub. Try again in a moment.
            </p>
          </div>
        ) : models.length === 0 ? (
          <div className="glass rounded-card p-6">
            <p className="text-[0.9rem] text-text-muted">
              No models match “{query}”. Try a different term.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m) => (
              <li
                key={m.id}
                className="glass glass-interactive flex flex-col rounded-card p-5"
              >
                <a
                  href={`https://huggingface.co/${m.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-[0.9rem] font-medium text-text transition-colors hover:text-accent-stream"
                >
                  {m.id}
                </a>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-text-muted">
                  <span>↓ {compact(m.downloads)}</span>
                  <span>♥ {compact(m.likes)}</span>
                  {m.safetensors ? (
                    <span className="rounded-[4px] border border-accent-stream/40 bg-accent-stream/10 px-1.5 py-0.5 uppercase tracking-eyebrow text-accent-stream">
                      safetensors
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto pt-4">
                  <CopyCommand command={`dlm pull ${m.id}`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

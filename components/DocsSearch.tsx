"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DOCS_NAV } from "./docsNav";

interface Entry {
  href: string;
  label: string;
  group: string;
  keywords: string;
}

const ENTRIES: Entry[] = DOCS_NAV.flatMap((g) =>
  g.items
    .filter((l) => !l.external)
    .map((l) => ({
      href: l.href,
      label: l.label,
      group: g.group,
      keywords: l.keywords ?? "",
    }))
);

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K to open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ENTRIES;
    const terms = query.split(/\s+/);
    return ENTRIES.filter((e) => {
      const hay = `${e.label} ${e.group} ${e.keywords}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [q]);

  const go = (href: string) => {
    setOpen(false);
    window.location.href = href;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[0.82rem] text-text-muted transition-colors hover:text-text"
      >
        <span aria-hidden>⌕</span>
        <span className="flex-1">Search docs…</span>
        <kbd className="rounded-[4px] border border-glass-border px-1.5 py-0.5 font-mono text-[0.62rem]">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search docs"
            className="glass glass-strong w-full max-w-lg overflow-hidden rounded-card"
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search the docs…"
              className="w-full border-b border-glass-border bg-transparent px-4 py-3.5 text-[0.95rem] text-text placeholder:text-text-muted/70 focus:outline-none"
            />
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-[0.85rem] text-text-muted">
                  No matches.
                </li>
              ) : (
                results.map((r, i) => (
                  <li key={r.href}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r.href)}
                      className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-left transition-colors ${
                        i === active ? "bg-accent-stream/10" : ""
                      }`}
                    >
                      <span
                        className={`text-[0.9rem] ${
                          i === active ? "text-accent-stream" : "text-text"
                        }`}
                      >
                        {r.label}
                      </span>
                      <span className="font-mono text-[0.62rem] uppercase tracking-eyebrow text-text-muted">
                        {r.group}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

// Searchable provider combobox. Options are Hugging Face authors: the top ones
// by default, and — as you type — authors derived from a live hub search, so it
// searches across all providers, not just a static list.
export function ProviderSelect({
  topProviders,
  active,
  onSelect,
}: {
  topProviders: string[];
  active: string;
  onSelect: (provider: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<string[]>(topProviders);
  const [loading, setLoading] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keep default options in sync once the hub seeds the top providers.
  useEffect(() => {
    if (!search) setOptions(topProviders);
  }, [topProviders, search]);

  // Focus the search on open; close on Escape or outside click.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  // Provider search — debounced, HF-backed: derive authors from matching models.
  useEffect(() => {
    const term = search.trim();
    if (!term) {
      setOptions(topProviders);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(() => {
      fetch(`/api/hf-models?q=${encodeURIComponent(term)}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const models: { id: string }[] = Array.isArray(d.models) ? d.models : [];
          setOptions([...new Set(models.map((m) => m.id.split("/")[0]))].slice(0, 25));
          setLoading(false);
        })
        .catch((e) => {
          if (e?.name !== "AbortError") setLoading(false);
        });
    }, 300);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [search, topProviders]);

  const pick = (provider: string) => {
    onSelect(provider);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 font-mono text-[0.72rem] text-text-muted transition-colors hover:border-text-muted/50 hover:text-text"
      >
        All providers
        <span
          aria-hidden
          className={`text-[0.6rem] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="glass glass-strong absolute left-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden rounded-card"
        >
          <div className="flex items-center gap-2 border-b border-glass-border px-3 py-2.5">
            <span className="text-text-muted" aria-hidden>
              ⌕
            </span>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search providers…"
              aria-label="Search providers"
              className="w-full bg-transparent font-mono text-[0.8rem] text-text placeholder:text-text-muted/70 focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1.5">
            <li>
              <button
                type="button"
                onClick={() => pick("")}
                className={`w-full rounded-[6px] px-2.5 py-1.5 text-left font-mono text-[0.78rem] transition-colors ${
                  active === ""
                    ? "bg-accent-stream/10 text-accent-stream"
                    : "text-text-muted hover:bg-white/[0.05] hover:text-text"
                }`}
              >
                All providers
              </button>
            </li>
            {loading ? (
              <li className="px-2.5 py-2 font-mono text-[0.75rem] text-text-muted">
                Searching…
              </li>
            ) : options.length === 0 ? (
              <li className="px-2.5 py-2 font-mono text-[0.75rem] text-text-muted">
                No providers found.
              </li>
            ) : (
              options.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active === p}
                    onClick={() => pick(p)}
                    className={`w-full truncate rounded-[6px] px-2.5 py-1.5 text-left font-mono text-[0.78rem] transition-colors ${
                      active === p
                        ? "bg-accent-stream/10 text-accent-stream"
                        : "text-text hover:bg-white/[0.05]"
                    }`}
                  >
                    {p}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

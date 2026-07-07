import type { ReactNode } from "react";

// Small set of presentational primitives shared by every /docs page — keeps the
// typography consistent without a `prose` dependency, and lets pages interleave
// prose with the interactive CopyCommand / TerminalBlock components freely.

export function DocTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-text">
      {children}
    </h1>
  );
}

export function DocLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-[1.05rem] leading-relaxed text-text-muted">
      {children}
    </p>
  );
}

export function DocH2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 border-t border-border pt-8 font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-text"
    >
      {children}
    </h2>
  );
}

export function DocH3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="mt-8 scroll-mt-24 font-display text-[1.05rem] font-medium text-text"
    >
      {children}
    </h3>
  );
}

export function DocP({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-[0.92rem] leading-relaxed text-text-muted">
      {children}
    </p>
  );
}

export function DocUl({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2.5">{children}</ul>;
}

export function DocLi({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[0.9rem] leading-relaxed text-text-muted">
      <span
        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-stream"
        aria-hidden
      />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[4px] bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.82em] text-text">
      {children}
    </code>
  );
}

export function DocA({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className="text-accent-stream underline-offset-2 transition-colors hover:underline"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function DocNote({
  tone = "stream",
  children,
}: {
  tone?: "stream" | "compute";
  children: ReactNode;
}) {
  const dot = tone === "compute" ? "text-accent-compute" : "text-accent-stream";
  return (
    <div className="glass mt-6 flex items-start gap-3 rounded-card p-4">
      <span className={`mt-0.5 text-[0.7rem] ${dot}`} aria-hidden>
        ●
      </span>
      <div className="text-[0.85rem] leading-relaxed text-text-muted">
        {children}
      </div>
    </div>
  );
}

export function DocTable({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="glass mt-6 overflow-x-auto rounded-card">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {head.map((h) => (
              <th
                key={h}
                className="p-3.5 font-mono text-[0.68rem] uppercase tracking-eyebrow text-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className="p-3.5 align-top text-[0.85rem] leading-relaxed text-text-muted [&_code]:text-text"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Prev/next pager at the foot of each doc page.
export function DocPager({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <nav className="mt-16 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
      {prev ? (
        <a
          href={prev.href}
          className="glass glass-interactive group rounded-card px-4 py-3 transition-colors sm:max-w-[48%]"
        >
          <div className="font-mono text-[0.62rem] uppercase tracking-eyebrow text-text-muted">
            ← Previous
          </div>
          <div className="mt-1 text-[0.9rem] text-text">{prev.label}</div>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a
          href={next.href}
          className="glass glass-interactive group rounded-card px-4 py-3 text-right transition-colors sm:max-w-[48%]"
        >
          <div className="font-mono text-[0.62rem] uppercase tracking-eyebrow text-text-muted">
            Next →
          </div>
          <div className="mt-1 text-[0.9rem] text-text">{next.label}</div>
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

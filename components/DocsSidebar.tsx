"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { DOCS_NAV } from "./docsNav";
import { DocsSearch } from "./DocsSearch";

export function DocsSidebar() {
  const pathname = usePathname();

  const list = (
    <nav className="space-y-6" aria-label="Docs">
      {DOCS_NAV.map((g) => (
        <div key={g.group}>
          <div className="eyebrow px-2">{g.group}</div>
          <ul className="mt-2 space-y-0.5">
            {g.items.map((l) => {
              const active = pathname === l.href;
              const cls = `block rounded-[6px] px-2 py-1.5 text-[0.85rem] transition-colors ${
                active
                  ? "bg-accent-stream/10 font-medium text-accent-stream"
                  : "text-text-muted hover:bg-white/[0.04] hover:text-text"
              }`;
              return (
                <li key={l.href}>
                  {l.external ? (
                    <a
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={cls}
                    >
                      {l.label}
                      <span className="ml-1 text-text-muted" aria-hidden>
                        ↗
                      </span>
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cls}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <aside className="lg:w-[220px] lg:shrink-0">
      <div className="mb-4">
        <DocsSearch />
      </div>
      {/* Mobile: native disclosure, no extra JS */}
      <details className="glass rounded-card p-2 lg:hidden">
        <summary className="cursor-pointer list-none px-2 py-1.5 font-mono text-[0.8rem] text-text">
          <span className="text-text-muted">Docs · </span>
          {DOCS_NAV.flatMap((g) => g.items).find((l) => l.href === pathname)
            ?.label ?? "Menu"}
          <span className="float-right text-text-muted">▾</span>
        </summary>
        <div className="mt-3 border-t border-border pt-3">{list}</div>
      </details>

      {/* Desktop: sticky rail */}
      <div className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
        {list}
      </div>
    </aside>
  );
}

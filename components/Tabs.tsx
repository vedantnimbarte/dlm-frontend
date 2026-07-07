"use client";

import { useState } from "react";

export interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
}

// Reusable tab switcher — used for the per-OS and per-GPU-backend instructions
// on Get started. Real content differs per tab, so tabs carry information.
export function Tabs({ tabs, ariaLabel }: { tabs: Tab[]; ariaLabel: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="glass glass-interactive rounded-card p-1.5">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1 border-b border-glass-border pb-1.5"
      >
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-[6px] px-3 py-1.5 font-mono text-[0.75rem] transition-colors ${
              i === active
                ? "bg-white/[0.07] text-text"
                : "text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="p-4">
        {tabs[active].content}
      </div>
    </div>
  );
}

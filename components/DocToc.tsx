"use client";

import { useEffect, useState } from "react";

interface Head {
  id: string;
  text: string;
  level: number;
}

// Builds an "On this page" rail from the rendered h2/h3 ids in the doc content,
// with scroll-spy. Reads the DOM after mount, so it works with any page.
export function DocToc() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("main h2[id], main h3[id]")
    );
    const hs = nodes.map((n) => ({
      id: n.id,
      text: n.textContent ?? "",
      level: n.tagName === "H3" ? 3 : 2,
    }));
    setHeads(hs);
    if (hs.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  if (heads.length < 2) return null;

  return (
    <aside className="hidden w-[200px] shrink-0 xl:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="eyebrow mb-3">On this page</div>
        <ul className="space-y-1.5 border-l border-border">
          {heads.map((h) => (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? "1.5rem" : "0.75rem" }}>
              <a
                href={`#${h.id}`}
                className={`block text-[0.8rem] leading-snug transition-colors ${
                  activeId === h.id
                    ? "font-medium text-accent-stream"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

"use client";

import { useEffect } from "react";

// One global pointer listener drives the specular sheen on every
// `.glass-interactive` surface: it writes --mx/--my (cursor position within
// the hovered pane) and --sheen (fade in/out). Delegation keeps the glass
// cards themselves as plain server components. Disabled for coarse pointers
// and reduced-motion, where the sheen would only add noise.
export function PointerSheen() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let active: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        ".glass-interactive"
      ) as HTMLElement | null;

      if (target !== active) {
        if (active) active.style.setProperty("--sheen", "0");
        active = target;
        if (active) active.style.setProperty("--sheen", "1");
      }
      if (!active) return;

      const r = active.getBoundingClientRect();
      active.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      active.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    const leave = () => {
      if (active) active.style.setProperty("--sheen", "0");
      active = null;
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return null;
}

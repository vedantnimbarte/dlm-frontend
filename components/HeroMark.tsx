"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// The logo-reveal moment. On load the mark rises out of a dark radial "well"
// in the aurora — scale + blur settle over ~1s, then a one-time specular sheen
// sweeps across the steel. On fine pointers it tilts subtly toward the cursor
// (parallax), so the metal catches the light as you move. Reduced motion skips
// straight to the resolved state with no tilt.
export function HeroMark() {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setRevealed(true));
    const el = ref.current;
    if (!el) return () => cancelAnimationFrame(t);

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return () => cancelAnimationFrame(t);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      el.style.setProperty("--rx", `${(-dy * 12).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(dx * 16).toFixed(2)}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="hero-mark-stage" aria-hidden>
      {/* dark well the mark emerges from */}
      <div className="hero-mark-well" />
      <div
        ref={ref}
        className={`hero-mark-tilt ${revealed ? "is-revealed" : ""}`}
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={520}
          height={520}
          priority
          className="hero-mark-img"
        />
        <span className="hero-mark-sheen" />
      </div>
    </div>
  );
}

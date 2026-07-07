"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/get-started", label: "Get started" },
];

const REPO = "https://github.com/vedantnimbarte/dlm";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-glass-border bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.8)]"
          : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center gap-2" aria-label="Primary">
        {/* Brand mark — hidden at the top of the page, slides in once scrolled
            (desktop). Always visible on mobile, where there's no center rail. */}
        <a
          href="/"
          className="nav-logo items-center rounded-full p-0.5"
          data-show={scrolled}
          aria-label="dlm — home"
        >
          <Logo size={32} priority />
        </a>

        {/* Desktop rail: spacers carry the center→right glide of the links.
            A hidden ghost of the CTA on the left balances the real CTA's width,
            so equal spacers put the links at true center (not just track-center). */}
        <div className="hidden flex-1 items-center md:flex">
          <span
            className="nav-ghost mr-8 invisible"
            data-collapsed={scrolled}
            aria-hidden
          >
            {githubCta(false)}
          </span>
          <span className="nav-spacer" style={{ flexGrow: 1 }} aria-hidden />
          <div className="flex items-center gap-8">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[0.9375rem] text-text-muted transition-colors hover:text-text"
              >
                {l.label}
              </a>
            ))}
          </div>
          <span
            className="nav-spacer"
            style={{ flexGrow: scrolled ? 0 : 1 }}
            aria-hidden
          />
          <span className="ml-8">{githubCta(true)}</span>
        </div>

        <button
          type="button"
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-btn border border-border text-text-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-lg leading-none">{open ? "✕" : "≡"}</span>
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="glass border-x-0 border-b-0 md:hidden"
        >
          <div className="shell flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-btn px-2 py-2.5 text-text-muted hover:bg-white/5 hover:text-text"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href={REPO}
              className="btn-secondary mt-2 justify-start"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubGlyph />
              View on GitHub ★
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// Shared GitHub CTA. interactive=true → the real link; false → an inert clone
// used as a left-side width counterweight so the desktop links center exactly.
function githubCta(interactive: boolean) {
  const inner = (
    <>
      <GitHubGlyph />
      <span>GitHub</span>
      <span className="text-text-muted">★</span>
    </>
  );
  const cls = "btn-secondary h-9 px-3.5 text-[0.875rem]";
  return interactive ? (
    <a href={REPO} className={cls} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

function GitHubGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

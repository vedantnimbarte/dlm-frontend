import { Logo } from "./Logo";
import { ReportBug } from "./ReportBug";

const REPO = "https://github.com/vedantnimbarte/dlm";

const COLS = [
  {
    head: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Benchmarks", href: "/benchmarks" },
      { label: "Docs", href: "/docs" },
      { label: "Get started", href: "/get-started" },
      { label: "About", href: "/about" },
    ],
  },
  {
    head: "Source",
    links: [
      { label: "GitHub", href: REPO },
      { label: "Apache-2.0", href: `${REPO}/blob/main/LICENSE` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="rule">
      <div className="shell grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-2">
          <a href="/" className="inline-flex rounded-full p-0.5" aria-label="dlm — home">
            <Logo size={34} />
          </a>
          <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed text-text-muted">
            Dynamic layer-streaming inference. Run massive models on the hardware
            you already have.
          </p>
        </div>
        {COLS.map((c) => (
          <nav key={c.head} aria-label={c.head}>
            <div className="eyebrow">{c.head}</div>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[0.85rem] text-text-muted transition-colors hover:text-text"
                    {...(l.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="shell flex flex-col items-start justify-between gap-2 py-5 text-[0.75rem] text-text-muted sm:flex-row sm:items-center">
          <span>© 2026 dlm · Apache-2.0 licensed open source.</span>
          <ReportBug className="text-[0.75rem] text-text-muted underline-offset-2 transition-colors hover:text-text hover:underline" />
        </div>
      </div>
    </footer>
  );
}

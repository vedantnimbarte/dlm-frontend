import { Nav } from "./Nav";
import { Footer } from "./Footer";

const REPO = "https://github.com/vedantnimbarte/Flip";

export function PagePlaceholder({
  eyebrow,
  title,
  intro,
  outline,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  outline: string[];
}) {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="shell py-20 sm:py-28">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-muted">
            {intro}
          </p>

          <div className="glass glass-interactive mt-12 max-w-xl rounded-card p-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-compute" aria-hidden />
              <span className="font-mono text-[0.72rem] uppercase tracking-eyebrow text-text-muted">
                In progress
              </span>
            </div>
            <p className="mt-3 text-[0.9rem] text-text-muted">
              This page is being built. It will cover:
            </p>
            <ul className="mt-4 space-y-2">
              {outline.map((o) => (
                <li key={o} className="flex gap-2.5 text-[0.9rem] text-text">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-stream" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/" className="btn-secondary h-10 text-[0.875rem]">
                ← Back home
              </a>
              <a
                href={REPO}
                className="btn-primary h-10 text-[0.875rem]"
                target="_blank"
                rel="noreferrer"
              >
                Read the repo
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

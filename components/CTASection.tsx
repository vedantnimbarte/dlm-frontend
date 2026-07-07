import { Reveal } from "./Reveal";

const REPO = "https://github.com/vedantnimbarte/dlm";

export function CTASection() {
  return (
    <section className="rule">
      <div className="shell py-20 sm:py-24">
        <Reveal>
          <div className="glass glass-interactive relative overflow-hidden rounded-card p-8 sm:p-12">
            <div className="relative max-w-2xl">
              <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
                The GPU you already own is enough.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-text-muted">
                Clone the repo, run the profiler on your card, and watch a 70B
                model fit where it shouldn&rsquo;t. No GPU required to try it.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="/get-started" className="btn-primary">
                  Get started
                </a>
                <a
                  href={REPO}
                  className="btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub ★
                </a>
              </div>
              <p className="mt-6 font-mono text-[0.72rem] text-text-muted">
                Apache-2.0 · Rust 1.75+ · Linux · macOS · Windows
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

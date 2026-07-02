import { VramVisualizer } from "./VramVisualizer";

const REPO = "https://github.com/cloudairy/flip";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ambient: a faint indigo→teal wash, quiet machinery under load */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 32rem at 15% -10%, rgba(110,139,255,0.10), transparent 60%), radial-gradient(50rem 30rem at 95% 0%, rgba(61,216,196,0.08), transparent 55%)",
        }}
      />
      <div className="shell grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24">
        <div className="max-w-xl animate-fade-up">
          <span className="eyebrow">Dynamic layer-streaming inference</span>
          <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.025em] text-text">
            Run a 70B model on{" "}
            <span className="text-accent-stream">16&nbsp;GB</span> of VRAM.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-text-muted">
            flip streams transformer layers in and out of your GPU as it
            computes — so model size stops being a hardware wall.
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
              View on GitHub
            </a>
          </div>
          <p className="mt-5 font-mono text-[0.72rem] text-text-muted">
            Apache-2.0 · No GPU required to try the profiler.
          </p>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <VramVisualizer />
          <p className="mt-2.5 text-center text-[0.72rem] text-text-muted">
            Live budget — same formula the engine runs. Try your own card.
          </p>
        </div>
      </div>
    </section>
  );
}

import { VramVisualizer } from "./VramVisualizer";
import { HeroMark } from "./HeroMark";

const REPO = "https://github.com/vedantnimbarte/dlm";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="shell flex flex-col items-center pb-14 pt-14 text-center sm:pt-16">
        <HeroMark />

        <span className="eyebrow mt-9 animate-fade-up">
          Dynamic layer-streaming inference
        </span>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,6.2vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-text animate-fade-up [animation-delay:60ms]">
          Run a 70B model on 16&nbsp;GB of VRAM.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted animate-fade-up [animation-delay:120ms]">
          dlm streams transformer layers in and out of your GPU as it computes —
          so model size stops being a hardware wall.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-up [animation-delay:180ms]">
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
        <p className="mt-6 font-mono text-[0.72rem] text-text-muted animate-fade-up [animation-delay:240ms]">
          Apache-2.0 · No GPU required to try the profiler.
        </p>
      </div>

      <div className="shell pb-20">
        <div className="mx-auto max-w-3xl animate-fade-up [animation-delay:300ms]">
          <VramVisualizer />
          <p className="mt-3 text-center text-[0.72rem] text-text-muted">
            Live budget — same formula the engine runs. Try your own card.
          </p>
        </div>
      </div>
    </section>
  );
}

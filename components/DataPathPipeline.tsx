import { Reveal } from "./Reveal";

// Genuinely sequential → numbering carries real information (§6.4).
const STAGES = [
  { n: "01", label: "mmap", sub: "NVMe", note: "weights memory-mapped from disk" },
  { n: "02", label: "CPU-RAM cache", sub: "tiered", note: "hot layers held in host RAM" },
  { n: "03", label: "Pinned staging", sub: "DMA", note: "page-locked buffer for transfer" },
  { n: "04", label: "Streaming buffer", sub: "VRAM", note: "next window lands here" },
  { n: "05", label: "Compute", sub: "GPU", note: "current window executes" },
];

export function DataPathPipeline() {
  return (
    <div className="mt-12">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STAGES.map((s, i) => (
          <Reveal key={s.n} delay={i * 110}>
            <div className="glass glass-interactive group relative flex h-full flex-col rounded-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.72rem] text-accent-stream">
                  {s.n}
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-eyebrow text-text-muted">
                  {s.sub}
                </span>
              </div>
              <div className="mt-6 font-semibold text-text">{s.label}</div>
              <p className="mt-1 text-[0.8rem] leading-snug text-text-muted">
                {s.note}
              </p>
              {i < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 font-mono text-text-muted md:inline"
                >
                  →
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <p className="mt-5 max-w-2xl font-mono text-[0.8rem] leading-relaxed text-text-muted">
          Stages 01–04 run <span className="text-accent-stream">asynchronously</span>{" "}
          while stage 05 computes. The transfer never blocks the GPU — DMA hides
          under compute, so the next layer is already resident when it&rsquo;s
          needed.
        </p>
      </Reveal>
    </div>
  );
}

import { Reveal } from "./Reveal";

// No decorative 01/02/03 here — the grid isn't a sequence. Each card carries a
// small state marker where the feature is a roadmap item, per §8 (honesty).
const FEATURES = [
  {
    title: "Zero-dependency local inference",
    body: "A single Rust binary. No Python runtime, no container, no cloud call. Runs air-gapped on the machine you already have.",
    state: "shipped",
  },
  {
    title: "OpenAI-compatible API",
    body: "Drop-in /v1/chat/completions endpoint, so existing clients and SDKs point at flip with a URL change.",
    state: "planned",
  },
  {
    title: "Dynamic VRAM profiling",
    body: "flip profile measures your card and reports exactly how many layers stay resident — before you load a single weight.",
    state: "shipped",
  },
  {
    title: "Double-buffered async streaming",
    body: "The A/B buffer schedule overlaps PCIe transfer with GPU compute, so layer loading hides under the math.",
    state: "shipped",
  },
  {
    title: "Speculative decoding",
    body: "A small draft model proposes tokens the large model verifies in batches — more tokens per resident window.",
    state: "planned",
  },
  {
    title: "Multi-GPU / multi-node scaling",
    body: "Partition the layer stack across cards and hosts to widen the resident window and push throughput up.",
    state: "planned",
  },
];

export function FeatureGrid() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <Reveal key={f.title} delay={(i % 3) * 80} className="bg-surface">
          <div className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[1.05rem] font-semibold leading-snug text-text">
                {f.title}
              </h3>
              <StateTag state={f.state} />
            </div>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-text-muted">
              {f.body}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function StateTag({ state }: { state: string }) {
  const planned = state === "planned";
  return (
    <span
      className={`mt-0.5 shrink-0 rounded-[4px] border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-eyebrow ${
        planned
          ? "border-accent-compute/40 bg-accent-compute/10 text-accent-compute"
          : "border-accent-stream/40 bg-accent-stream/10 text-accent-stream"
      }`}
    >
      {planned ? "planned" : "shipped"}
    </span>
  );
}

import { Reveal } from "./Reveal";

// A bento of glass tiles — the marquee feature in each row runs wide (2fr),
// its partner narrow (1fr), giving the grid rhythm without inventing a
// sequence. Each card still carries an honest shipped/planned state marker (§8),
// and a faint state-tinted corner glow (teal = shipped, amber = planned) is the
// only accent — kept inside the illustration, never on chrome.
const FEATURES = [
  {
    title: "Zero-dependency local inference",
    body: "A single Rust binary. No Python runtime, no container, no cloud call. Runs air-gapped on the machine you already have.",
    state: "shipped",
  },
  {
    title: "OpenAI-compatible API",
    body: "Drop-in /v1/chat/completions endpoint, so existing clients and SDKs point at dlm with a URL change.",
    state: "shipped",
  },
  {
    title: "Dynamic VRAM profiling",
    body: "dlm profile measures your card and reports exactly how many layers stay resident — before you load a single weight.",
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
    state: "shipped",
  },
  {
    title: "Multi-GPU / multi-node scaling",
    body: "Partition the layer stack across cards and hosts to widen the resident window and push throughput up.",
    state: "shipped",
  },
  {
    title: "Cross-request prefix cache",
    body: "Requests that share a system prompt resume from a cached KV snapshot instead of re-prefilling it — real savings on shared prefixes.",
    state: "shipped",
  },
  {
    title: "Continuous batching",
    body: "A background scheduler admits concurrent requests into each streaming pass, with per-request output identical to running alone.",
    state: "shipped",
  },
];

export function FeatureGrid() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {FEATURES.map((f, i) => {
        const wide = i % 2 === 0;
        const shipped = f.state !== "planned";
        return (
          <Reveal
            key={f.title}
            delay={(i % 3) * 80}
            className={wide ? "lg:col-span-2" : "lg:col-span-1"}
          >
            <div className="glass glass-interactive relative flex h-full flex-col overflow-hidden rounded-card p-6">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl"
                style={{
                  background: shipped
                    ? "radial-gradient(circle, var(--accent-stream), transparent 70%)"
                    : "radial-gradient(circle, var(--accent-compute), transparent 70%)",
                }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <h3 className="font-display text-[1.15rem] font-medium leading-snug text-text">
                  {f.title}
                </h3>
                <StateTag state={f.state} />
              </div>
              <p className="relative mt-3 max-w-md text-[0.9rem] leading-relaxed text-text-muted">
                {f.body}
              </p>
            </div>
          </Reveal>
        );
      })}
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

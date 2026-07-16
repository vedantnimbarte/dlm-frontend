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
    title: "Quantize at load — the lever that matters",
    body: "--quant int4 shrinks each layer 4x (int8: 2x) from a float checkpoint, so more of the model stays resident and streaming shrinks or stops entirely. On a 4 GB card it took a 3B model from 0.024 tok/s streamed to 4.2 fully resident.",
    state: "shipped",
  },
  {
    title: "OpenAI + Anthropic API",
    body: "/v1/chat/completions, /v1/completions, /v1/messages and count_tokens — with SSE streaming, bearer or x-api-key auth, and Prometheus /metrics. Either SDK points at dlm with a URL change.",
    state: "shipped",
  },
  {
    title: "Dynamic VRAM profiling",
    body: "dlm profile measures your card and reports exactly how many layers stay resident — before you load a single weight.",
    state: "shipped",
  },
  {
    title: "Layer streaming, for what still won't fit",
    body: "A bounded LRU window of layers; a miss uploads on a dedicated copy stream so the transfer overlaps compute, and evicts least-recently-used. Output is bit-for-bit identical to a fully-resident run — but streaming costs bandwidth, so quantize first.",
    state: "shipped",
  },
  {
    title: "Speculative decoding",
    body: "A small draft model proposes tokens the large model verifies in bulk; with greedy sampling the output is provably identical to plain decoding. Per-request acceptance lands in the usage response.",
    state: "shipped",
  },
  {
    title: "Multi-GPU / multi-node scaling",
    body: "Pipeline-parallel across local GPUs, or shard layers across worker nodes over TCP with heartbeats and local fallback. Scheduling, routing and correctness are implemented and tested on CPU over localhost; NCCL/RCCL transport is future work.",
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

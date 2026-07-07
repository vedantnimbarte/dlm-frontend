import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ZoneDiagram } from "@/components/ZoneDiagram";
import { DataPathPipeline } from "@/components/DataPathPipeline";
import { CTASection } from "@/components/CTASection";
import { MODELS, computeVram, SAFETY_GB, DEFAULT_CONTEXT, pct } from "@/lib/vram";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The deep dive: VRAM partitioning, the double-buffered A/B schedule, the tiered data path, the LayersToLoad formula with a worked 70B example, the compute-kernel trait, and the serve-and-scale stack.",
};

// Worked example computed from the same formula the engine uses — no invented
// numbers. Defaults match the README headline case (70B @ 16 GB → 29/80).
const M = MODELS.find((m) => m.id === "70b")!;
const R = computeVram(M, 16);

const VARS = [
  { sym: "M_free", val: "16 GB", desc: "Free VRAM reported by the GPU runtime (simulated off-GPU)." },
  { sym: "M_safety", val: `${SAFETY_GB} GB`, desc: "Cushion for activation spikes." },
  { sym: "M_kv_total", val: `${R.kvGB.toFixed(1)} GB`, desc: `Paged KV cache summed across all layers, for the whole ${DEFAULT_CONTEXT.toLocaleString()}-token context.` },
  { sym: "M_pinned", val: `${M.pinnedGB} GB`, desc: "Embeddings, final norm, and LM head — always resident." },
  { sym: "M_layer_weight", val: `${M.layerWeightGB} GB`, desc: "One streamed transformer block (largest measured, or estimated)." },
];

const KERNELS = [
  {
    name: "CpuKernel",
    state: "shipped",
    tag: "oracle",
    body: "The real math: a Llama-style decode block — RMSNorm, RoPE, grouped-query attention over the KV history, SwiGLU MLP. A complete, if slow, CPU forward path, and the correctness oracle the GPU kernel is checked against.",
  },
  {
    name: "StubKernel",
    state: "shipped",
    tag: "testing",
    body: "A trivial deterministic kernel that exercises the orchestration — KV growth, per-layer iteration — in isolation, without the cost of real math.",
  },
  {
    name: "GpuKernel",
    state: "validated",
    tag: "cuda-kernels",
    body: "A CUDA run_block on the device, mirroring the CPU oracle op-for-op. KV history stays resident in VRAM, so only the hidden vector crosses PCIe per token — not the whole history. Validated against the CPU kernel.",
  },
];

const STACK = [
  {
    title: "OpenAI-compatible server",
    state: "shipped",
    body: "A dependency-free HTTP server exposing the OpenAI /v1/chat/completions and Anthropic /v1/messages endpoints (both with SSE streaming), plus /v1/models. Real tokenizers, chat templates, per-request sampling, bearer + x-api-key auth. Started by dlm serve.",
  },
  {
    title: "Continuous batching",
    state: "shipped",
    body: "A background scheduler keeps up to max_batch generations in flight, advancing each one token per tick and admitting queued requests as slots free. Each request's output is identical to running it alone.",
  },
  {
    title: "Speculative decoding",
    state: "shipped",
    body: "A cheap draft model proposes gamma tokens; the target verifies them and accepted tokens advance in bulk. With greedy sampling the output is provably identical to plain decoding, with acceptance-rate stats.",
  },
  {
    title: "Multi-GPU pipeline parallelism",
    state: "shipped",
    body: "dlm serve --multi-gpu-ids splits the layer stack into contiguous per-GPU stages so only the hidden residual crosses the boundary — a split run is bit-for-bit identical to a single device.",
  },
  {
    title: "Distributed master-worker",
    state: "shipped",
    body: "Layers shard across worker nodes; a coordinator streams the hidden state through them as length-prefixed Protobuf over TCP. Heartbeats track liveness, and an unreachable worker falls back to local CPU-RAM.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* Header */}
        <section className="shell pb-4 pt-20 sm:pt-28">
          <Reveal>
            <span className="eyebrow">Deep dive</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              How dlm runs a 70B model on 16 GB.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-muted">
              Resident loading assumes every weight sits in VRAM at once. dlm
              drops that assumption: it keeps a small window of transformer
              blocks resident and streams the next window in over PCIe while the
              GPU computes the current one. Here's the whole machine, from the
              partition to the math to the serving stack.
            </p>
          </Reveal>
        </section>

        {/* VRAM partitioning */}
        <Section
          eyebrow="The partition"
          title="Three zones split the VRAM."
          intro="VRAM is carved into a zone that never moves, a zone that holds a working window of layers, and a cache that spills to CPU RAM and NVMe. Each zone has a job, and only one of them churns."
        >
          <ZoneDiagram />
        </Section>

        {/* The A/B schedule */}
        <Section
          eyebrow="The schedule"
          title="Two buffers, swapped every window."
          intro="The streaming zone holds two buffers, A and B. While A executes on the compute stream, B is DMA-ing the next window of layers in over PCIe. When A finishes, they swap — B computes, A loads. The swap is the whole trick: transfer hides under compute, so the GPU rarely waits on the bus."
        >
          <Reveal delay={80} className="mt-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass glass-interactive rounded-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-accent-compute" aria-hidden />
                  <span className="eyebrow">Buffer A · executing</span>
                </div>
                <div className="buffer-a h-8 rounded-[4px]" aria-hidden />
                <p className="mt-3 text-[0.85rem] leading-relaxed text-text-muted">
                  The resident window runs the transformer math for this token,
                  layer by layer, threading each layer's real K/V history.
                </p>
              </div>
              <div className="glass glass-interactive rounded-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-accent-stream" aria-hidden />
                  <span className="eyebrow">Buffer B · streaming in</span>
                </div>
                <div className="buffer-b h-8 rounded-[4px]" aria-hidden />
                <p className="mt-3 text-[0.85rem] leading-relaxed text-text-muted">
                  The next window DMAs into VRAM from the pinned staging buffer,
                  asynchronously, so it's ready the instant A finishes.
                </p>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* The data path */}
        <Section
          eyebrow="The data path"
          title="Each layer travels disk → compute, just in time."
          intro="A streamed layer is memory-mapped from NVMe, held in a tiered host-RAM cache, staged in a page-locked buffer, streamed into VRAM, and executed. mmap skips the OS read-buffer copy; the hot-layer cache skips the disk read on repeat; the pinned buffer lets the PCIe controller DMA straight to VRAM — so I/O and copies hide under GPU compute."
        >
          <DataPathPipeline />
        </Section>

        {/* The math */}
        <Section
          eyebrow="The budget math"
          title="How many layers stay resident."
          intro="The profiler decides the resident window size with one formula. Everything after the fixed costs — safety, KV cache, pinned zone — is spent on as many streamed layers as fit."
        >
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* Formula + worked example */}
            <Reveal>
              <div className="glass glass-interactive flex h-full flex-col rounded-card p-6 sm:p-8">
                <span className="eyebrow">LayersToLoad</span>

                {/* The equation */}
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-text">
                  <span className="text-[1.05rem]">LayersToLoad =</span>
                  <span className="text-2xl text-text-muted">⌊</span>
                  <span className="inline-flex flex-col items-center text-center">
                    <span className="px-2 pb-1.5 text-[0.9rem] leading-tight">
                      M<sub>free</sub> − M<sub>safety</sub> − M<sub>kv</sub> −
                      M<sub>pinned</sub>
                    </span>
                    <span className="h-px w-full bg-border" />
                    <span className="px-2 pt-1.5 text-[0.9rem] leading-tight">
                      M<sub>layer_weight</sub>
                    </span>
                  </span>
                  <span className="text-2xl text-text-muted">⌋</span>
                </div>

                <p className="mt-4 text-[0.82rem] leading-relaxed text-text-muted">
                  Clamped to [1, N_layers] — streaming needs at least one
                  resident slot, and never more than the model has.
                </p>

                {/* Worked example */}
                <div className="mt-7 rounded-[8px] border border-border bg-bg/50 p-5">
                  <div className="eyebrow">Worked · {M.params} @ 16 GB</div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.9rem]">
                    <span className="text-2xl text-text-muted">⌊</span>
                    <span className="inline-flex flex-col items-center text-center text-text">
                      <span className="px-1.5 pb-1.5">
                        16 − {SAFETY_GB} − {R.kvGB.toFixed(1)} − {M.pinnedGB}
                      </span>
                      <span className="h-px w-full bg-border" />
                      <span className="px-1.5 pt-1.5">{M.layerWeightGB}</span>
                    </span>
                    <span className="text-2xl text-text-muted">⌋</span>
                    <span className="text-text">=</span>
                    <span className="text-lg font-semibold text-accent-stream">
                      {R.layersResident}
                    </span>
                    <span className="text-text-muted">/ {M.nLayers} layers</span>
                  </div>
                  <p className="mt-4 text-[0.82rem] leading-relaxed text-text-muted">
                    {R.layersResident} of {M.nLayers} layers stay resident —{" "}
                    <span className="text-accent-stream">
                      {pct(R.residentFraction)}%
                    </span>{" "}
                    in VRAM — and the other {R.streamedLayers} stream through the
                    A/B window. A 70B model fits on a 16 GB card.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Variable glossary */}
            <Reveal delay={80}>
              <div className="glass glass-interactive flex h-full flex-col rounded-card p-6 sm:p-8">
                <span className="eyebrow">The terms</span>
                <dl className="mt-5 space-y-4">
                  {VARS.map((v) => (
                    <div
                      key={v.sym}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <dt className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[0.85rem] text-text">
                          {v.sym}
                        </span>
                        <span className="font-mono text-[0.85rem] font-semibold text-accent-pinned tnum">
                          {v.val}
                        </span>
                      </dt>
                      <dd className="mt-1.5 text-[0.82rem] leading-relaxed text-text-muted">
                        {v.desc}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Kernels */}
        <Section
          eyebrow="The compute kernel"
          title="One trait, three interchangeable kernels."
          intro="The transformer math sits behind a block-level ComputeKernel trait — run_block runs one decoder block for one token. A ForwardOrchestrator drives a sequence through the model autoregressively, calling the kernel per layer. Three kernels plug into the same slot."
        >
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {KERNELS.map((k, i) => (
              <Reveal key={k.name} delay={i * 90}>
                <div className="glass glass-interactive flex h-full flex-col rounded-card p-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-mono text-[0.95rem] font-medium text-text">
                      {k.name}
                    </h3>
                    <StateTag state={k.state} label={k.tag} />
                  </div>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-text-muted">
                    {k.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* The full stack */}
        <Section
          eyebrow="Serve & scale"
          title="What sits above the streaming core."
          intro="The core streams layers; the stack around it turns that into a server — continuous batching, speculative decoding, multi-GPU pipeline parallelism, and distributed master-worker serving."
        >
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 80}>
                <div className="glass glass-interactive flex h-full flex-col rounded-card p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[1.05rem] font-medium leading-snug text-text">
                      {s.title}
                    </h3>
                    <StateTag state={s.state} />
                  </div>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-text-muted">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}

// State marker — teal accent, shows the feature's shipped/validated status.
function StateTag({ state, label }: { state: string; label?: string }) {
  const text: Record<string, string> = {
    shipped: "shipped",
    validated: "validated",
  };
  return (
    <span className="mt-0.5 shrink-0 rounded-[4px] border border-accent-stream/40 bg-accent-stream/10 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-eyebrow text-accent-stream">
      {label ?? text[state] ?? state}
    </span>
  );
}

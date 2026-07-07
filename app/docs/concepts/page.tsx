import type { Metadata } from "next";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  DocUl,
  DocLi,
  Code,
  DocA,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";
import { MODELS, computeVram, SAFETY_GB, pct } from "@/lib/vram";

const M = MODELS.find((m) => m.id === "70b")!;
const R = computeVram(M, 16);

export const metadata: Metadata = {
  title: "Architecture & math",
  description:
    "The three VRAM zones, the A/B schedule, the LayersToLoad formula, the compute kernels, and distributed serving — in reference form.",
};

export default function Concepts() {
  const { prev, next } = docPager("/docs/concepts");
  return (
    <>
      <DocTitle>Architecture &amp; math</DocTitle>
      <DocLead>
        A reference summary of how dlm streams layers. For the illustrated,
        long-form walkthrough — zone diagrams, the animated A/B schedule, the data
        path — see <DocA href="/how-it-works">How it works</DocA>.
      </DocLead>

      <DocH2 id="zones">The three VRAM zones</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Pinned zone</strong> — embedding, LM head,
          and norms stay resident permanently; moving them each step would thrash
          the PCIe bus.
        </DocLi>
        <DocLi>
          <strong className="text-text">Streaming zone</strong> — two buffers,{" "}
          <Code>A</Code> and <Code>B</Code>. While A executes on the compute
          stream, B DMAs the next window of layers in over PCIe, then they swap.
        </DocLi>
        <DocLi>
          <strong className="text-text">Cache zone</strong> — the PagedAttention
          KV cache plus residual activations, spilling to a tiered CPU-RAM cache
          backed by mmap&rsquo;d NVMe weights.
        </DocLi>
      </DocUl>

      <DocH2 id="data-path">The data path</DocH2>
      <DocP>
        A streamed layer travels{" "}
        <Code>mmap (NVMe) → CPU-RAM cache → pinned staging → streaming-zone buffer → compute</Code>
        . mmap skips the OS read-buffer copy; the hot-layer cache skips the disk
        read on repeat; and the page-locked host buffer lets the PCIe controller
        DMA straight to VRAM asynchronously — so disk I/O and copies hide under GPU
        compute.
      </DocP>

      <DocH2 id="formula">The LayersToLoad formula</DocH2>
      <DocP>
        The profiler decides how many transformer blocks fit resident at once:
      </DocP>
      <div className="glass mt-6 rounded-card p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.9rem] text-text">
          <span>LayersToLoad =</span>
          <span className="text-xl text-text-muted">⌊</span>
          <span className="inline-flex flex-col items-center text-center">
            <span className="px-1.5 pb-1.5 text-[0.82rem] leading-tight">
              M<sub>free</sub> − M<sub>safety</sub> − M<sub>kv_total</sub> −
              M<sub>pinned</sub>
            </span>
            <span className="h-px w-full bg-border" />
            <span className="px-1.5 pt-1.5 text-[0.82rem] leading-tight">
              M<sub>layer_weight</sub>
            </span>
          </span>
          <span className="text-xl text-text-muted">⌋</span>
        </div>
        <div className="mt-5 border-t border-border pt-4 font-mono text-[0.85rem]">
          <span className="text-text-muted">{M.params} @ 16 GB → </span>
          <span className="text-text">
            ⌊(16 − {SAFETY_GB} − {R.kvGB.toFixed(1)} − {M.pinnedGB}) /{" "}
            {M.layerWeightGB}⌋
          </span>
          <span className="text-text"> = </span>
          <span className="font-semibold text-accent-stream">
            {R.layersResident}
          </span>
          <span className="text-text-muted">
            {" "}
            / {M.nLayers} ({pct(R.residentFraction)}% resident)
          </span>
        </div>
      </div>
      <DocUl>
        <DocLi>
          <Code>M_free</Code> — free VRAM from the GPU runtime (simulated off-GPU).
        </DocLi>
        <DocLi>
          <Code>M_safety</Code> — cushion for activation spikes (default 1.5 GiB in
          the engine).
        </DocLi>
        <DocLi>
          <Code>M_kv_total</Code> — KV cache for the whole context, summed across
          all layers.
        </DocLi>
        <DocLi>
          <Code>M_pinned</Code> — the permanent pinned-zone cost (embedding + LM
          head + norms).
        </DocLi>
        <DocLi>
          <Code>M_layer_weight</Code> — size of one streamed block.
        </DocLi>
      </DocUl>
      <DocP>
        The result is clamped to <Code>[1, N_layers]</Code>. Try it live on the{" "}
        <DocA href="/benchmarks">Benchmarks</DocA> page.
      </DocP>

      <DocH2 id="kernels">The compute kernels</DocH2>
      <DocP>
        The transformer math sits behind a block-level <Code>ComputeKernel</Code>{" "}
        trait — <Code>run_block</Code> runs one decoder block for one token. Three
        kernels plug into the same slot:
      </DocP>
      <DocUl>
        <DocLi>
          <Code>CpuKernel</Code> — the real Llama-style decode block (RMSNorm,
          RoPE, GQA, SwiGLU); the correctness oracle.
        </DocLi>
        <DocLi>
          <Code>StubKernel</Code> — a trivial deterministic kernel for testing the
          orchestration in isolation.
        </DocLi>
        <DocLi>
          <Code>GpuKernel</Code> — a CUDA <Code>run_block</Code> mirroring the CPU
          oracle op-for-op; KV history stays resident in VRAM, so only the hidden
          vector crosses PCIe per token.
        </DocLi>
      </DocUl>

      <DocH2 id="scaling">Distributed & scaling</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Continuous batching</strong> — a scheduler
          keeps up to <Code>max_batch</Code> generations in flight, admitting
          queued requests as slots free.
        </DocLi>
        <DocLi>
          <strong className="text-text">Speculative decoding</strong> — a draft
          model proposes tokens the target verifies in bulk; with greedy sampling
          the output is provably identical to plain decoding.
        </DocLi>
        <DocLi>
          <strong className="text-text">Multi-GPU pipeline parallelism</strong> —
          contiguous per-GPU stages so only the hidden residual crosses the
          boundary; a split run is bit-for-bit identical to a single device.
        </DocLi>
        <DocLi>
          <strong className="text-text">Distributed master-worker</strong> — layer
          shards across nodes, hidden state streamed as length-prefixed Protobuf
          over TCP, with heartbeats and CPU-RAM fallback for a dead worker.
        </DocLi>
      </DocUl>
      <DocPager prev={prev} next={next} />
    </>
  );
}

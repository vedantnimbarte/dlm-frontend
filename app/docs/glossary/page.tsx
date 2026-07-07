import type { Metadata } from "next";
import {
  DocTitle,
  DocLead,
  DocH2,
  Code,
  DocA,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Definitions of the terms used throughout dlm — the VRAM zones, streaming, the kernels, and the transformer building blocks.",
};

export default function Glossary() {
  const { prev, next } = docPager("/docs/glossary");
  return (
    <>
      <DocTitle>Glossary</DocTitle>
      <DocLead>
        The vocabulary used across these docs, in one place. Deeper explanations
        live on <DocA href="/docs/concepts">Architecture &amp; math</DocA>.
      </DocLead>

      <DocH2 id="streaming">Streaming & memory</DocH2>
      <DocTable
        head={["Term", "Definition"]}
        rows={[
          ["Pinned zone", "The VRAM region for embeddings, final norm, and the LM head — always resident, never streamed."],
          ["Streaming zone", "The VRAM region holding the working window of transformer layers, double-buffered as A and B."],
          ["Cache zone", "The KV cache plus residual activations, spilling to a tiered CPU-RAM cache backed by mmap'd NVMe weights."],
          ["Resident window", "The set of layers held in VRAM at once. Its size is layers_to_load, tunable with --resident-layers."],
          [<Code key="t">layers_to_load</Code>, "How many transformer blocks fit resident, from the LayersToLoad budget formula."],
          ["Double buffer (A/B)", "Two streaming-zone buffers: A executes while B streams the next window in over PCIe, then they swap."],
          ["Host fallback", "The no-GPU build — page-aligned host buffers with the same layout contract, so the pipeline runs anywhere."],
        ]}
      />

      <DocH2 id="attention">Attention & the KV cache</DocH2>
      <DocTable
        head={["Term", "Definition"]}
        rows={[
          ["KV cache", "The stored keys and values of past tokens, so attention doesn't recompute the whole history each step."],
          ["PagedAttention", "A KV cache split into fixed-size blocks (pages), so memory is allocated in units rather than one contiguous span."],
          ["GQA", "Grouped-query attention — multiple query heads share a smaller set of key/value heads, shrinking the KV footprint."],
          ["RoPE", "Rotary position embedding — encodes token position by rotating the query/key vectors."],
          ["RMSNorm", "Root-mean-square layer normalization, used before attention and the MLP."],
          ["SwiGLU", "The gated MLP activation in the feed-forward block."],
        ]}
      />

      <DocH2 id="kernels">Kernels & scaling</DocH2>
      <DocTable
        head={["Term", "Definition"]}
        rows={[
          ["ComputeKernel", "The trait behind the transformer math; run_block runs one decoder block for one token."],
          ["CPU oracle", "The CpuKernel — the reference implementation the GPU kernel is validated against, op for op."],
          ["Speculative decoding", "A draft model proposes tokens the target verifies in bulk; accepted tokens advance together."],
          ["Continuous batching", "A scheduler advancing many in-flight generations one token per tick, admitting new requests as slots free."],
          ["Pipeline parallelism", "Splitting the layer stack into per-GPU stages so only the hidden residual crosses each boundary."],
          ["Quantization (Q4)", "4-bit weights (~0.5 bytes/param) so more layers fit per gigabyte; GPTQ-style projections dequantize on load."],
        ]}
      />

      <DocPager prev={prev} next={next} />
    </>
  );
}

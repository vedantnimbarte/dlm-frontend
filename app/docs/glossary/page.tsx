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
          ["Streaming zone", "The VRAM region holding the working window of transformer layers — an LRU of --resident-layers blocks, refilled by a background prefetch worker."],
          ["Cache zone", "The PagedAttention KV cache plus residual activations. KV for every layer stays resident in VRAM even while weights stream, so attention always sees the full history."],
          ["Resident window", "The set of layers held in VRAM at once. Its size is layers_to_load, tunable with --resident-layers."],
          [<Code key="t">layers_to_load</Code>, "How many transformer blocks fit resident, from the LayersToLoad budget formula."],
          ["Window miss", "A layer the window doesn't hold: it uploads on a dedicated copy stream (overlapping compute on the default stream) and evicts the least-recently-used layer."],
          ["Double buffer (A/B)", "The planner's DoubleBufferSchedule — the load/compute schedule dlm profile reports. The serve-path streaming zone is the LRU window above, not an A/B swap."],
          [<Code key="t">--ram-cache-gb</Code>, "A host-RAM LRU of materialized layer weights, so a window miss skips the disk read and re-materialization. Off by default; it caches weights, never KV."],
          ["Host fallback", "The no-GPU build — page-aligned host buffers with the same layout contract, so the pipeline runs anywhere."],
        ]}
      />

      <DocH2 id="attention">Attention & the KV cache</DocH2>
      <DocTable
        head={["Term", "Definition"]}
        rows={[
          ["KV cache", "The stored keys and values of past tokens, so attention doesn't recompute the whole history each step."],
          ["PagedAttention", "A KV cache split into fixed-size blocks (pages), so memory is allocated in units rather than one contiguous span."],
          [
            <>KV quantization (<Code key="t">--kv-quant</Code>)</>,
            "int8 for about half the KV memory, int4 for about a quarter with more error. Independent of --quant, which sizes the weights.",
          ],
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
          [
            <>
              <DocA key="t" href="/docs/quantization">
                Quantization (<Code>--quant</Code>)
              </DocA>
            </>,
            "dlm quantizes a float checkpoint at load — int4 (0.5 bytes/param) or int8 (1.0), group-affine in groups of 128. Already-quantized GPTQ/AWQ exports are refused.",
          ],
        ]}
      />

      <DocPager prev={prev} next={next} />
    </>
  );
}

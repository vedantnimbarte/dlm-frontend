import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  DocUl,
  DocLi,
  Code,
  DocA,
  DocNote,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Performance tuning",
  description:
    "The levers that move tok/s: --quant first, then the resident window, host-RAM cache, warm NVMe and PCIe, speculative decoding, continuous batching, and context length.",
};

export default function Performance() {
  const { prev, next } = docPager("/docs/performance");
  return (
    <>
      <DocTitle>Performance tuning</DocTitle>
      <DocLead>
        Throughput on a streaming engine is a balance: the more layers stay
        resident, the less streaming has to hide under compute. These are the
        levers, from biggest effect to smallest.
      </DocLead>

      <DocH2 id="levers">The levers</DocH2>
      <DocTable
        head={["Lever", "Effect"]}
        rows={[
          [
            <Code key="l">--quant int4 | int8</Code>,
            <>
              Shrinks each layer 2–4x at load, so more of the model stays
              resident and streaming shrinks or stops entirely — worth far more
              than making streaming itself faster. On a 4 GB GTX 1650,
              Llama-3.2-3B goes from{" "}
              <strong className="text-text">0.024 tok/s</strong> streaming bf16
              to <strong className="text-text">4.2 tok/s</strong> fully resident
              at int4. See <DocA href="/docs/quantization">Quantization</DocA>.
            </>,
          ],
          [
            <Code key="l">--resident-layers</Code>,
            "More resident layers → fewer streaming passes → closer to the compute ceiling. Fewer → fits a bigger model. Start at the profiler's plan.",
          ],
          [
            "NVMe + PCIe",
            "A warm host-RAM cache skips the disk read; a faster PCIe generation drains the streaming window quicker. Both raise the tok/s floor.",
          ],
          [
            <Code key="l">--prefetch-depth</Code>,
            "Load the next N layers while the current one computes, hiding load latency under the math. --auto-prefetch tunes the depth to your disk. Watch dlm_stream_layer_misses_total on /metrics.",
          ],
          [
            <Code key="l">--draft-model-path</Code>,
            "Speculative decoding accepts several tokens per resident window — more tokens per streaming pass.",
          ],
          [
            "Continuous batching",
            "Concurrent requests share each streaming pass, so aggregate throughput rises even when single-stream tok/s doesn't.",
          ],
          [
            <Code key="l">--prefix-cache-size</Code>,
            "Cache prompt-prefix KV snapshots — requests that share a system prompt resume from the snapshot instead of re-prefilling it. Big win when many requests share a long prefix.",
          ],
          [
            <Code key="l">--context-length</Code>,
            "A longer context spends more of the VRAM budget on the KV cache, leaving fewer layers resident. Shorten it to keep more layers in VRAM.",
          ],
          [
            <Code key="l">--kv-quant int8 | int4</Code>,
            "Quantize the KV cache — int8 ≈ half its memory, int4 ≈ a quarter. At long context the KV cache can exceed the weights, so this frees budget for more resident layers; int4 trades more approximation for more room.",
          ],
          [
            <Code key="l">--ram-cache-gb N</Code>,
            "A host-RAM LRU of materialized layers, so an evicted layer isn't re-read and re-decoded — roughly 2x on the streamed path. Off by default: it duplicates weights in RAM on top of the OS page cache.",
          ],
        ]}
      />
      <DocNote tone="compute">
        <Code>--stream</Code> plus a quantized <Code>--quant</Code> currently
        re-quantizes a layer on every window miss — slower than either flag
        alone. Pair it with <Code>--ram-cache-gb</Code>, or drop{" "}
        <Code>--stream</Code>: once quantized, the model often no longer needs
        it.
      </DocNote>

      <DocH2 id="measure">Measure your setup first</DocH2>
      <DocP>
        Before tuning, run the profiler — it reports how many layers stay
        resident and the streaming-pass count for your exact card, no weights
        loaded.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm profile --model-path /path/to/model" />
      </div>
      <DocNote>
        Try the interactive version on the{" "}
        <DocA href="/benchmarks">Benchmarks</DocA> page — change the VRAM and model
        and watch the resident count and tok/s band update live.
      </DocNote>

      <DocH2 id="recipes">Recipes</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Biggest model that fits</strong> —{" "}
          <Code>--quant int4</Code> first (4x smaller layers is what actually
          makes a model fit), then shorten <Code>--context-length</Code>, and
          stream only what&rsquo;s left over. Lowering{" "}
          <Code>--resident-layers</Code> shrinks the window, it does not make a
          model fit.
        </DocLi>
        <DocLi>
          <strong className="text-text">Fastest single stream</strong> — raise{" "}
          <Code>--resident-layers</Code> as high as the budget allows, keep the
          NVMe cache warm, and add a draft model.
        </DocLi>
        <DocLi>
          <strong className="text-text">Most total throughput</strong> — let
          continuous batching admit concurrent requests; each shares the resident
          window.
        </DocLi>
        <DocLi>
          <strong className="text-text">Beyond one card</strong> — see{" "}
          <DocA href="/docs/distributed">Distributed &amp; multi-GPU</DocA> to
          widen the window across GPUs or nodes.
        </DocLi>
      </DocUl>

      <DocPager prev={prev} next={next} />
    </>
  );
}

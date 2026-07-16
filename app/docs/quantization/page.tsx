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
  title: "Quantization",
  description:
    "--quant int4|int8 shrinks each layer 2–4x at load, so more of the model stays resident and streaming shrinks or stops. The single highest-leverage flag on a small card.",
};

export default function Quantization() {
  const { prev, next } = docPager("/docs/quantization");
  return (
    <>
      <DocTitle>Quantization</DocTitle>
      <DocLead>
        <Code>--quant</Code> is the first flag to reach for on a card that
        can&rsquo;t hold the model. Quantizing the weights at load shrinks each
        layer 2–4x, which usually means{" "}
        <strong className="text-text">
          more of the model stays resident and streaming shrinks or stops
          entirely
        </strong>{" "}
        — worth far more than any amount of making streaming itself faster.
      </DocLead>

      <DocH2 id="default">There is no default</DocH2>
      <DocP>
        Omit <Code>--quant</Code> and dlm computes in{" "}
        <strong className="text-text">the checkpoint&rsquo;s own precision</strong>{" "}
        — it reads the dtype the file actually holds (<Code>bf16</Code>/
        <Code>f16</Code> → 16-bit, <Code>f32</Code> → 32-bit) and converts to f32
        only in the register that consumes each weight. There is no default to get
        wrong, and nothing is upsized: an f32 copy of bf16 weights is lossless
        (every bf16 value is exactly an f32), so it would buy no precision while
        doubling VRAM, PCIe per streamed layer, and GEMV bandwidth.
      </DocP>

      <DocH2 id="schemes">Schemes</DocH2>
      <DocTable
        head={["--quant", "Bytes/param", "What happens"]}
        rows={[
          [
            <em key="p">(omitted)</em>,
            "2.0 / 4.0",
            "The checkpoint's own dtype — no conversion.",
          ],
          [
            <Code key="p">int4</Code>,
            "0.5",
            "Quantized at load — 4x smaller, coarsest (16 levels per group).",
          ],
          [
            <Code key="p">int8</Code>,
            "1.0",
            "Quantized at load — 2x smaller, 256 levels per group.",
          ],
          [
            <>
              <Code key="p">fp16</Code> / <Code>f32</Code>
            </>,
            "2.0 / 4.0",
            "Accepted only if it matches the checkpoint — dlm does not convert between float widths.",
          ],
        ]}
      />
      <DocP>
        Both quantized modes are group-affine in groups of 128 —{" "}
        <Code>w = (code − zero[g]) × scale[g]</Code> — decoded in-register by the
        same kernel that reads the float dtypes. A scheme dlm cannot actually
        deliver is an error, not a silent no-op: <Code>--quant</Code> never
        describes weights that don&rsquo;t exist.
      </DocP>

      <DocH2 id="measured">What it buys, measured</DocH2>
      <DocP>
        On a 4 GB GTX 1650 running Llama-3.2-3B — 5.6 GiB of bf16 layers, i.e. a
        model that does <strong className="text-text">not</strong> fit:
      </DocP>
      <DocTable
        head={["Setting", "Layer", "Resident", "tok/s"]}
        rows={[
          [
            <>
              bf16, <Code key="q">--stream</Code>
            </>,
            "192 MiB",
            "5 / 28",
            "0.024",
          ],
          [
            <Code key="q">--quant int8</Code>,
            "96 MiB",
            "all 28 (no streaming)",
            <strong key="t" className="text-text">
              3.0
            </strong>,
          ],
          [
            <Code key="q">--quant int4</Code>,
            "48 MiB",
            "all 28 (no streaming)",
            <strong key="t" className="text-text">
              4.2
            </strong>,
          ],
        ]}
      />
      <DocP>
        int4 is faster than int8 for the same reason it is smaller: the GEMV is
        bandwidth-bound, so halving the bytes read halves the work. Pick int8 when
        int4 costs too much accuracy — its 256 levels per group track a
        weight&rsquo;s range ~17x finer than int4&rsquo;s 16 — and pick int4 when
        you need the model to fit at all.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path ./models/Llama-3.2-3B-Instruct --quant int4" />
      </div>

      <DocH2 id="caveats">Caveats</DocH2>
      <DocP>
        Both are lossy: group-affine rounding without the calibration GPTQ/AWQ
        use. Check your model&rsquo;s output rather than assuming. Three things
        worth knowing:
      </DocP>
      <DocUl>
        <DocLi>
          <strong className="text-text">Quantizing costs load time</strong> — it
          runs over every weight, and reads the full 16-bit tensors from disk
          regardless. The win is in VRAM and on the bus, not in what is read.
        </DocLi>
        <DocLi>
          <strong className="text-text">
            <Code>--stream</Code> + a quantized <Code>--quant</Code> currently
            re-quantizes a layer on every window miss
          </strong>
          , which is far slower than either flag alone. Pair it with{" "}
          <Code>--ram-cache-gb</Code> (which caches the quantized layer), or drop{" "}
          <Code>--stream</Code> — once quantized, the model often no longer needs
          it.
        </DocLi>
        <DocLi>
          <strong className="text-text">
            A quantized weight is still lossy even if it fits.
          </strong>{" "}
          A model that fits but answers worse is not obviously a win.
        </DocLi>
      </DocUl>

      <DocH2 id="gptq">Already-quantized checkpoints (GPTQ / AWQ)</DocH2>
      <DocNote tone="compute">
        <strong className="text-text">
          GPTQ/AWQ checkpoints are refused at load, not silently mis-loaded.
        </strong>{" "}
        Use an fp16/bf16 checkpoint and let <Code>--quant</Code> quantize it
        itself.
      </DocNote>
      <DocP>
        Already-quantized checkpoints ship packed <Code>qweight</Code>/
        <Code>qzeros</Code>/<Code>scales</Code> triplets — a different thing from{" "}
        <Code>--quant</Code>, which quantizes a <em>float</em> checkpoint itself.
        dlm&rsquo;s 4-bit dequantizer is round-trip tested against dlm&rsquo;s own
        packer, but has never been validated against a real export — and exporters
        disagree on the zero-point convention (AutoGPTQ stores <Code>zero − 1</Code>
        ) and on act-order column permutation. Getting either wrong yields{" "}
        <em>plausible-looking but incorrect</em> weights, which is a far worse
        failure than an honest error.
      </DocP>
      <DocP>
        Re-enabling this needs a real GPTQ fixture plus a parity test — the code is
        still there behind the refusal. See{" "}
        <DocA href="/docs/models">Model support</DocA> for everything else that
        loads or gets rejected.
      </DocP>

      <DocH2 id="kv">Quantizing the KV cache instead</DocH2>
      <DocP>
        <Code>--quant</Code> sizes the <em>weights</em>.{" "}
        <Code>--kv-quant &#123;none,int8,int4&#125;</Code> is an independent knob
        that sizes the <em>KV history</em> — int8 for about half the KV memory,
        int4 for about a quarter with more error. At long context the KV cache can
        exceed the weights, so quantizing it buys context in the same budget. See{" "}
        <DocA href="/docs/performance">Performance tuning</DocA>.
      </DocP>

      <DocNote>
        See <DocA href="/docs/concepts">the budget math</DocA> for how{" "}
        <Code>M_layer_weight</Code> feeds the resident-layer count, or try the{" "}
        <DocA href="/calculator">VRAM calculator</DocA> to see what a given{" "}
        <Code>--quant</Code> does to your card.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

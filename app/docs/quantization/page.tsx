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
  DocNote,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Quantization",
  description:
    "How dlm handles weight precision — float formats and GPTQ-style 4-bit projections dequantized on load — and what it means for VRAM and quality.",
};

export default function Quantization() {
  const { prev, next } = docPager("/docs/quantization");
  return (
    <>
      <DocTitle>Quantization</DocTitle>
      <DocLead>
        Weight precision decides how many layers fit per gigabyte — the whole
        point of streaming a big model through a small card. dlm loads float and
        4-bit checkpoints, dequantizing the latter on load.
      </DocLead>

      <DocH2 id="formats">Supported precisions</DocH2>
      <DocTable
        head={["Precision", "Bytes/param", "Notes"]}
        rows={[
          [<Code key="p">F32</Code>, "4", "Full precision — largest footprint."],
          [<Code key="p">F16 / BF16</Code>, "2", "Half precision — the common float checkpoint."],
          [
            <Code key="p">GPTQ 4-bit</Code>,
            "~0.5",
            "Packed int4 projections, dequantized into dense weights on load.",
          ],
        ]}
      />

      <DocH2 id="gptq">The 4-bit path</DocH2>
      <DocP>
        GPTQ-style quantized projections ship as{" "}
        <Code>.qweight</Code>/<Code>.qzeros</Code>/<Code>.scales</Code> tensors.
        The loader unpacks the int32 packing, applies the group scales and
        zero-points, transposes, and materializes dense weights the kernels can
        run.
      </DocP>
      <DocUl>
        <DocLi>
          The packing, grouping, and transpose are round-trip-tested.
        </DocLi>
        <DocLi>
          Matching a specific exporter byte-for-byte — AWQ&rsquo;s nibble
          permutation, GPTQ&rsquo;s exact zero-point bias — needs real fixtures,
          noted at the call site. Treat non-standard exporters as best-effort.
        </DocLi>
      </DocUl>

      <DocH2 id="vram">Why it matters for VRAM</DocH2>
      <DocP>
        At ~0.5 bytes/param, a 4-bit layer is roughly a quarter the size of BF16 —
        so four times as many layers stay resident for the same budget, and less
        weight streams over PCIe per token. That&rsquo;s why the profiler&rsquo;s
        headline case (70B on 16 GB) assumes Q4 weights.
      </DocP>
      <DocNote>
        See <DocA href="/docs/concepts">the budget math</DocA> for how{" "}
        <Code>M_layer_weight</Code> feeds the resident-layer count, and{" "}
        <DocA href="/docs/performance">Performance tuning</DocA> for the tok/s
        tradeoff.
      </DocNote>

      <DocH2 id="choosing">Choosing a precision</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Fit a bigger model</strong> — prefer a Q4
          checkpoint; more layers stay resident.
        </DocLi>
        <DocLi>
          <strong className="text-text">Maximize quality</strong> — use F16/BF16
          and lean on streaming to fit, at some tok/s cost.
        </DocLi>
        <DocLi>
          Only <DocA href="/docs/models">safetensors</DocA> checkpoints load,
          float or GPTQ 4-bit.
        </DocLi>
      </DocUl>

      <DocPager prev={prev} next={next} />
    </>
  );
}

import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import { ReportBug } from "@/components/ReportBug";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocH3,
  DocP,
  Code,
  DocA,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Troubleshooting",
  description:
    "Common dlm errors and their fixes — won't-fit, rejected formats, gated repos, GPU fallback — plus a short FAQ.",
};

export default function Troubleshooting() {
  const { prev, next } = docPager("/docs/troubleshooting");
  return (
    <>
      <DocTitle>Troubleshooting</DocTitle>
      <DocLead>
        Most issues are a model that won&rsquo;t fit, an unsupported checkpoint, or
        a GPU build that can&rsquo;t find its runtime. Start with{" "}
        <Code>dlm doctor</Code>, then match your symptom below.
      </DocLead>

      <DocH2 id="doctor">First: run doctor</DocH2>
      <DocP>
        It reports the GPU backend and free VRAM, runs a CPU inference self-check,
        and — with <Code>--model-path</Code> — confirms the checkpoint loads and
        tokenizes.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm doctor --model-path /path/to/model" />
      </div>

      <DocH2 id="errors">Common errors</DocH2>
      <DocTable
        head={["Symptom", "Fix"]}
        rows={[
          [
            <>Won&rsquo;t fit / even one layer exceeds the budget</>,
            <>
              Start with <Code>--quant int4</Code> — it shrinks each layer 4x at
              load and often removes streaming entirely. Then lower{" "}
              <Code>--safety-margin-gb</Code> (default 1.5; try{" "}
              <Code>0.5</Code> on a 4 GB card), shorten{" "}
              <Code>--context-length</Code>, and only then fall back to{" "}
              <Code>--stream</Code>/<Code>--resident-layers</Code> for whatever
              still doesn&rsquo;t fit. See{" "}
              <DocA href="/docs/quantization">Quantization</DocA> and{" "}
              <DocA href="/docs/performance">Performance tuning</DocA>.
            </>,
          ],
          [
            "GGUF / PyTorch-only repo rejected",
            <>
              dlm loads <strong className="text-text">safetensors only</strong>.
              Convert the checkpoint, or pull a safetensors variant. See{" "}
              <DocA href="/docs/models">Model support</DocA>.
            </>,
          ],
          [
            "401 / gated or private repo on pull",
            <>
              Pass <Code>--token</Code> or set <Code>$HF_TOKEN</Code>.
            </>,
          ],
          [
            "CUDA runtime can't load at startup",
            <>
              dlm warns and falls back to CPU on its own. Check{" "}
              <Code>cudart</Code> is on the library path and{" "}
              <Code>CUDA_PATH</Code> is set.
            </>,
          ],
          [
            <>
              <Code>--device gpu</Code> errors on a CPU build
            </>,
            <>
              A CPU-only build can&rsquo;t use the GPU. Rebuild with{" "}
              <Code>--features cuda-kernels</Code>. See{" "}
              <DocA href="/docs/build">Build &amp; features</DocA>.
            </>,
          ],
          [
            "nvcc not found when building cuda-kernels",
            <>
              Install the CUDA Toolkit 12.x (nvcc). <Code>cargo check</Code>{" "}
              type-checks the FFI without it, but building a runnable kernel needs
              nvcc + a GPU.
            </>,
          ],
          [
            "Model directory not recognized",
            <>
              The path needs <Code>config.json</Code> and one or more{" "}
              <Code>*.safetensors</Code> shards. <Code>dlm pull</Code> fetches the
              right files.
            </>,
          ],
        ]}
      />

      <DocH2 id="faq">FAQ</DocH2>

      <DocH3>Do I need a GPU to try dlm?</DocH3>
      <DocP>
        No. The profiler and the CPU path run on any machine — the host fallback
        needs no GPU. A GPU build adds the CUDA/ROCm kernels.
      </DocP>

      <DocH3>Can I run a model bigger than my VRAM?</DocH3>
      <DocP>
        Yes — that&rsquo;s the point. Streaming holds a bounded window of layers
        and materializes the rest on demand, so a model can exceed the resident
        budget. Output is identical to a fully-resident run.
      </DocP>

      <DocH3>Which quantization formats load?</DocH3>
      <DocP>
        Float safetensors only (F32/F16/BF16). Already-quantized GPTQ/AWQ
        checkpoints are{" "}
        <strong className="text-text">refused at load</strong>, not
        silently mis-loaded. To quantize, use{" "}
        <Code>--quant int4</Code> or <Code>--quant int8</Code> on a float
        checkpoint — dlm quantizes it itself at load. See{" "}
        <DocA href="/docs/quantization">Quantization</DocA> and{" "}
        <DocA href="/docs/models">Model support</DocA>.
      </DocP>

      <DocH3>Is the output deterministic?</DocH3>
      <DocP>
        With <Code>temperature 0</Code> (greedy), yes — and speculative decoding,
        batching, and multi-GPU splits are all designed to produce identical
        output to a plain single-stream run.
      </DocP>

      <DocH2 id="report">Report a bug</DocH2>
      <DocP>
        Still stuck? File a bug and we&rsquo;ll take a look. The form prefills a
        GitHub issue in the dlm repo — include your <Code>dlm doctor</Code>{" "}
        output. You can also browse{" "}
        <DocA href="https://github.com/vedantnimbarte/dlm/issues">
          existing issues
        </DocA>{" "}
        first.
      </DocP>
      <div className="mt-5">
        <ReportBug className="btn-primary h-10 text-[0.875rem]" />
      </div>

      <DocPager prev={prev} next={next} />
    </>
  );
}

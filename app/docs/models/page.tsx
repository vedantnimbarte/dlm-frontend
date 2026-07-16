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
  title: "Model support",
  description:
    "Which architectures and formats dlm loads — safetensors, float weights, tokenizer detection — and what gets rejected, including already-quantized GPTQ/AWQ checkpoints.",
};

export default function Models() {
  const { prev, next } = docPager("/docs/models");
  return (
    <>
      <DocTitle>Model support &amp; formats</DocTitle>
      <DocLead>
        dlm loads standard Hugging Face safetensors checkpoints of Llama-style
        decoder models. Here&rsquo;s exactly what&rsquo;s supported, and what gets
        rejected with a clear message.
      </DocLead>

      <DocH2 id="architecture">Architecture</DocH2>
      <DocP>
        The engine runs a Llama-style decoder block — RMSNorm, RoPE, grouped-query
        attention over the KV history, and a SwiGLU MLP. Geometry (layers, hidden
        size, q/kv heads, head dim) is read from <Code>config.json</Code>.
      </DocP>
      <DocTable
        head={["Family", "Status"]}
        rows={[
          [
            "Llama 2 / 3 / 3.1 / 3.2",
            <>
              supported (incl. <Code>llama3</Code> RoPE scaling, GQA, tied
              embeddings)
            </>,
          ],
          ["Mistral", "supported"],
          ["Qwen2 / Qwen2.5", "supported (incl. the Q/K/V attention biases)"],
          [
            "Mixtral / any MoE",
            <>
              <strong className="text-text">not supported</strong> — errors on
              the missing expert tensors.
            </>,
          ],
          [
            "GPT-2 / Falcon / other layouts",
            <>
              <strong className="text-text">not supported</strong> — errors on
              unknown tensor names.
            </>,
          ],
          [
            "Gemma, Qwen3",
            <>
              <strong className="text-text">not supported</strong> — they need
              norm variants dlm does not implement.
            </>,
          ],
        ]}
      />
      <DocP>
        An unsupported architecture fails with a clear <Code>UnknownTensor</Code>{" "}
        error at load rather than producing garbage. A config declaring a{" "}
        <Code>rope_scaling</Code> type dlm does not implement is likewise{" "}
        <strong className="text-text">refused</strong>, not silently ignored —
        the model was <em>trained</em> with that scaling, so running without it
        yields fluent nonsense.
      </DocP>
      <DocP>
        Attention biases (<Code>q_proj.bias</Code>/<Code>k_proj.bias</Code>/
        <Code>v_proj.bias</Code>, which Qwen2 ships and Llama does not) are
        loaded when present, and <Code>rope_scaling</Code> (<Code>linear</Code>,{" "}
        <Code>llama3</Code>) is applied when the config declares it.
      </DocP>

      <DocH2 id="formats">Weight formats</DocH2>
      <DocTable
        head={["Format", "Supported", "Notes"]}
        rows={[
          [
            <Code key="f">safetensors</Code>,
            "Yes",
            "The only checkpoint container dlm loads. Zero-copy memory-mapped from disk.",
          ],
          [
            "F32 / F16 / BF16",
            "Yes",
            <>
              Standard HuggingFace-named <Code>.weight</Code> tensors, read
              directly from the mapped shards.
            </>,
          ],
          [
            "GPTQ / AWQ 4-bit",
            "No",
            <>
              Refused at load — a <Code>.qweight</Code> triplet is an error, not
              a slow path. Use an fp16/bf16 checkpoint and{" "}
              <Code>--quant int4</Code>. See{" "}
              <DocA href="/docs/quantization">Quantization</DocA>.
            </>,
          ],
          [
            "GGUF",
            "No",
            "Rejected — not a safetensors checkpoint.",
          ],
          [
            "PyTorch-only (.bin)",
            "No",
            "Rejected — provide a safetensors variant.",
          ],
        ]}
      />
      <DocNote tone="compute">
        <strong className="text-text">Why refused, not best-effort.</strong>{" "}
        dlm&rsquo;s 4-bit dequantizer is round-trip tested against dlm&rsquo;s own
        packer, but has never been validated against a real export — and
        exporters disagree on the zero-point convention (AutoGPTQ stores{" "}
        <Code>zero − 1</Code>) and on act-order column permutation. Getting
        either wrong yields <em>plausible-looking but incorrect</em> weights,
        which is a far worse failure than an honest error.
      </DocNote>

      <DocH2 id="tokenizers">Tokenizers</DocH2>
      <DocP>dlm detects the tokenizer from the model directory, in order:</DocP>
      <DocUl>
        <DocLi>
          <Code>tokenizer.json</Code> — HF BPE with special tokens.
        </DocLi>
        <DocLi>
          <Code>vocab.json</Code> + <Code>merges.txt</Code> — byte-level BPE.
        </DocLi>
        <DocLi>
          Neither present — a raw byte tokenizer.
        </DocLi>
      </DocUl>

      <DocH2 id="required-files">Required files</DocH2>
      <DocP>A loadable model directory contains:</DocP>
      <DocUl>
        <DocLi>
          <Code>config.json</Code> — the model geometry.
        </DocLi>
        <DocLi>
          one or more <Code>*.safetensors</Code> shards — the weights.
        </DocLi>
        <DocLi>a tokenizer (one of the forms above).</DocLi>
      </DocUl>

      <DocH2 id="getting">Getting models</DocH2>
      <DocP>
        Search and pull straight from the Hugging Face hub — <Code>pull</Code>{" "}
        fetches only the files dlm loads.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm search llama-3.2" />
        <CopyCommand command="dlm pull Qwen/Qwen2.5-0.5B-Instruct" />
      </div>
      <DocP>
        See the <DocA href="/docs/cli">CLI reference</DocA> for{" "}
        <Code>search</Code>/<Code>pull</Code> flags, and{" "}
        <DocA href="/docs/troubleshooting">Troubleshooting</DocA> if a checkpoint
        won&rsquo;t load.
      </DocP>

      <DocPager prev={prev} next={next} />
    </>
  );
}

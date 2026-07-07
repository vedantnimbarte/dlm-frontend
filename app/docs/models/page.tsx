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
    "Which architectures and formats dlm loads — safetensors, float and GPTQ 4-bit weights, tokenizer detection — and what gets rejected.",
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
            "GPTQ 4-bit",
            "Yes",
            <>
              <Code>.qweight</Code>/<Code>.qzeros</Code>/<Code>.scales</Code>{" "}
              projections, dequantized into dense weights on load.
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
        The int32 packing, grouping, and transpose of the 4-bit path are
        round-trip-tested. Matching a specific exporter byte-for-byte — AWQ&rsquo;s
        nibble permutation, GPTQ&rsquo;s zero-point bias — needs real fixtures,
        noted at the call site.
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

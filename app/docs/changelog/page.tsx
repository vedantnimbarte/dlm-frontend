import type { Metadata } from "next";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocUl,
  DocLi,
  Code,
  DocA,
  DocNote,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

const REPO = "https://github.com/vedantnimbarte/dlm";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Recent highlights in dlm — the Anthropic Messages API, the Hugging Face hub, GPU defaults, and the one-line installer.",
};

export default function Changelog() {
  const { prev, next } = docPager("/docs/changelog");
  return (
    <>
      <DocTitle>Changelog</DocTitle>
      <DocLead>
        Notable recent changes. For the authoritative, tagged version history,
        see <DocA href={`${REPO}/releases`}>GitHub Releases</DocA>; for every
        commit, the <DocA href={`${REPO}/commits`}>commit log</DocA>.
      </DocLead>

      <DocH2 id="api">API & serving</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Distributed serving</strong> —{" "}
          <Code>dlm serve --distributed-mode master --worker-nodes …</Code> now
          coordinates layer shards across worker nodes and serves the OpenAI
          endpoint directly, with heartbeats and CPU-RAM fallback on a dead
          worker.
        </DocLi>
        <DocLi>
          <strong className="text-text">Cross-request prefix cache</strong> —{" "}
          <Code>--prefix-cache-size N</Code> keeps prompt-prefix KV snapshots so
          requests sharing a system prompt resume instead of re-prefilling it.
        </DocLi>
        <DocLi>
          <strong className="text-text">Metrics &amp; access log</strong> —{" "}
          <Code>GET /metrics</Code> exposes Prometheus counters
          (<Code>dlm_requests_total</Code>, prompt/completion tokens, and — under{" "}
          <Code>--stream</Code> — layer-cache hits/misses and live prefetch
          depth); every request is logged to stderr.
        </DocLi>
        <DocLi>
          <strong className="text-text">More sampling controls</strong> —{" "}
          <Code>min_p</Code> truncation and <Code>repetition_penalty</Code> joined
          the per-request sampler; generation is cancelled when the client
          disconnects.
        </DocLi>
        <DocLi>
          <strong className="text-text">Anthropic Messages API</strong> — the
          server serves <Code>POST /v1/messages</Code> and{" "}
          <Code>/v1/messages/count_tokens</Code>, with SSE streaming
          (<Code>message_start</Code> → <Code>content_block_delta</Code> →{" "}
          <Code>message_stop</Code>) and <Code>x-api-key</Code> auth alongside
          bearer tokens.
        </DocLi>
        <DocLi>
          OpenAI-compatible server with continuous batching, speculative
          decoding, real tokenizers, chat templates, and request hardening
          (bearer/api-key auth, body-size cap).
        </DocLi>
      </DocUl>

      <DocH2 id="streaming">Streaming & memory</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Layer prefetch</strong> — the streaming
          engine loads the next layers while the current one computes, hiding
          load latency under the math. <Code>--prefetch-depth N</Code> sets how
          far ahead, and <Code>--auto-prefetch</Code> tunes it from measured
          load-vs-compute time.
        </DocLi>
        <DocLi>
          <strong className="text-text">KV-cache quantization</strong> —{" "}
          <Code>--kv-quant int8 | int4</Code> shrinks the KV cache (which can
          exceed the weights at long context) to roughly half or a quarter of its
          memory, freeing budget for more resident layers.
        </DocLi>
        <DocLi>
          <strong className="text-text">GPU weight prefetch</strong> — the GPU
          streaming path now uploads the next layer&rsquo;s weights to VRAM on a
          non-blocking copy stream, overlapping the PCIe transfer with compute.
          Validated on-device.
        </DocLi>
      </DocUl>

      <DocH2 id="models">Models & hub</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Hugging Face hub</strong> —{" "}
          <Code>dlm search</Code> and <Code>dlm pull</Code> find and download
          models straight from the hub, no <Code>hf</Code> CLI needed.
        </DocLi>
        <DocLi>
          Loader handles safetensors float (F32/F16/BF16) and GPTQ-style 4-bit
          projections.
        </DocLi>
      </DocUl>

      <DocH2 id="gpu">GPU & install</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">GPU by default</strong> on{" "}
          <Code>cuda-kernels</Code> builds; <Code>--device cpu</Code> forces the
          host kernel.
        </DocLi>
        <DocLi>
          <strong className="text-text">One-line installer</strong> — a prebuilt
          binary per platform, with automatic CUDA/CPU build selection.
        </DocLi>
      </DocUl>

      <DocNote>
        The project was renamed from <Code>flip</Code> to <Code>dlm</Code>{" "}
        (Dynamic LLM). Older references to <Code>flip</Code> in third-party posts
        refer to the same engine.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

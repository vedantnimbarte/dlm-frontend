import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  Code,
  DocA,
  DocNote,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "serve configuration",
  description:
    "The complete flag reference for dlm serve — model, network, weight precision (--quant), VRAM budget, streaming, device, batching, auth, tokenization, and scaling.",
};

export default function Config() {
  const { prev, next } = docPager("/docs/config");
  return (
    <>
      <DocTitle>serve configuration</DocTitle>
      <DocLead>
        Every flag on <Code>dlm serve</Code>, grouped by concern. Run{" "}
        <Code>dlm serve --help</Code> for the authoritative list on your build.
      </DocLead>

      <DocH2 id="model">Model & network</DocH2>
      <DocTable
        head={["Flag", "Default", "Purpose"]}
        rows={[
          [<Code key="f">--model-path</Code>, "—", "Directory with config.json + *.safetensors."],
          [<Code key="f">--host</Code>, <Code key="d">127.0.0.1</Code>, "Bind address."],
          [<Code key="f">--port</Code>, <Code key="d">8000</Code>, "TCP port."],
          [<Code key="f">--context-length</Code>, <Code key="d">8192</Code>, "KV context window in tokens."],
        ]}
      />

      <DocH2 id="memory">Memory & precision</DocH2>
      <DocTable
        head={["Flag", "Default", "Purpose"]}
        rows={[
          [
            <Code key="f">--quant int4 | int8</Code>,
            "checkpoint dtype",
            <>
              The primary memory lever. Quantizes the weights at load — int4 is 4x
              smaller, int8 2x — so more of the model stays resident and streaming
              shrinks or stops. Omit it and dlm computes in the checkpoint&rsquo;s
              own precision. See{" "}
              <DocA href="/docs/quantization">Quantization</DocA>.
            </>,
          ],
          [
            <Code key="f">--vram-budget-gb</Code>,
            "live query",
            "Manual upper VRAM cap in gigabytes. Overrides the live device query.",
          ],
          [
            <Code key="f">--safety-margin-gb</Code>,
            <Code key="d">1.5</Code>,
            "VRAM cushion held back for activation spikes. Lower it on a small card (e.g. 0.5 on a 4 GB GPU) to free room for more resident layers; raise it if you hit OOM.",
          ],
          [
            <Code key="f">--ram-cache-gb</Code>,
            "off",
            "Host-RAM budget (GiB) for the tiered layer cache between NVMe and GPU, so an evicted layer is not re-read from the checkpoint — roughly 2x on the streamed path.",
          ],
        ]}
      />

      <DocH2 id="compute">Compute & streaming</DocH2>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [
            <Code key="f">--stream</Code>,
            "Hold only a bounded window of layers in memory; materialize the rest on demand via an LRU. Lets a model exceed the resident budget.",
          ],
          [
            <Code key="f">--resident-layers N</Code>,
            "Size of the streaming window. Defaults to the VRAM plan's layers_to_load.",
          ],
          [
            <Code key="f">--prefetch-depth N</Code>,
            "Layers to prefetch ahead while streaming (default 1; 0 disables). Clamped to the window minus one.",
          ],
          [
            <Code key="f">--auto-prefetch</Code>,
            "Auto-tune the prefetch depth at runtime from measured load-vs-compute time, instead of a fixed depth.",
          ],
          [
            <Code key="f">--kv-quant none | int8 | int4</Code>,
            "Quantize the KV cache (which can exceed the weights at long context). int8 ≈ half the KV memory, int4 ≈ a quarter with more error; none (default) keeps exact f32.",
          ],
          [
            <Code key="f">--device gpu | cpu</Code>,
            "Select the compute kernel. GPU is the default on a cuda-kernels build; cpu forces the host kernel.",
          ],
        ]}
      />

      <DocH2 id="tokenization">Tokenization</DocH2>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [
            <Code key="f">--chat-template</Code>,
            <>
              <Code>plain</Code> | <Code>chatml</Code> | <Code>llama3</Code> —
              render chat messages in the model&rsquo;s trained format.
            </>,
          ],
          [
            <Code key="f">--eos-token</Code>,
            <>
              Stop generation on this token id. Overrides the{" "}
              <Code>eos_token_id</Code> auto-detected from <Code>config.json</Code>
              ; omit to use that.
            </>,
          ],
        ]}
      />
      <DocP>
        Tokenizers load automatically from the model directory. See{" "}
        <DocA href="/docs/models">Model support</DocA> for what&rsquo;s detected.
      </DocP>

      <DocH2 id="security">Security</DocH2>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [
            <Code key="f">--api-key</Code>,
            "Require a key on every route except the /, /health and /healthz liveness probes — /metrics included. Accepts Authorization: Bearer or x-api-key. See Deployment & security.",
          ],
        ]}
      />

      <DocH2 id="scaling">Batching & scaling</DocH2>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [<Code key="f">--draft-model-path</Code>, "Enable speculative decoding with a draft model."],
          [<Code key="f">--draft-gamma N</Code>, "Draft tokens proposed per speculative round (default 4). Only used with --draft-model-path."],
          [<Code key="f">--prefix-cache-size N</Code>, "Cache N prompt-prefix KV snapshots so shared prefixes skip re-prefill (0 = off). No effect with a draft model — speculative sessions can't resume."],
          [<Code key="f">--multi-gpu-ids 0,1,2</Code>, "Pipeline-parallel across local GPUs."],
          [<Code key="f">--distributed-mode master --worker-nodes host:port,…</Code>, "Coordinate layer shards across worker nodes and serve the OpenAI endpoint."],
          [<Code key="f">--distributed-mode worker</Code>, "Serve a layer shard to a master over TCP."],
        ]}
      />

      <DocH2 id="sampling">Sampling defaults</DocH2>
      <DocP>
        Sampling is set <strong className="text-text">per request</strong> on the
        HTTP API (<Code>temperature</Code>, <Code>top_p</Code>, <Code>top_k</Code>,{" "}
        <Code>min_p</Code>, <Code>repetition_penalty</Code>, <Code>seed</Code>,{" "}
        <Code>stop</Code>), not as serve flags. Temperature{" "}
        <Code>0</Code> is deterministic greedy. See the{" "}
        <DocA href="/docs/api">HTTP API</DocA> reference.
      </DocP>

      <DocH2 id="example">Full example</DocH2>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path /srv/models/llama-70b --quant int4 --context-length 8192 --stream --resident-layers 29 --device gpu --api-key sk-secret --host 0.0.0.0 --port 8000" />
      </div>
      <DocNote>
        Environment variables (<Code>CUDA_PATH</Code>, <Code>HF_TOKEN</Code>, …)
        are documented on <DocA href="/docs/build">Build &amp; features</DocA>.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

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
    "The complete flag reference for dlm serve — model, network, streaming, device, batching, auth, tokenization, and scaling.",
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
          [<Code key="f">--context-length</Code>, "model", "KV context window in tokens."],
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
            "Require a bearer token on all /v1/* routes. See Deployment & security.",
          ],
        ]}
      />

      <DocH2 id="scaling">Batching & scaling</DocH2>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [<Code key="f">--draft-model-path</Code>, "Enable speculative decoding with a draft model."],
          [<Code key="f">--multi-gpu-ids 0,1,2</Code>, "Pipeline-parallel across local GPUs."],
          [<Code key="f">--distributed-mode worker</Code>, "Serve a layer shard to a master over TCP."],
        ]}
      />

      <DocH2 id="sampling">Sampling defaults</DocH2>
      <DocP>
        Sampling is set <strong className="text-text">per request</strong> on the
        HTTP API (<Code>temperature</Code>, <Code>top_p</Code>, <Code>top_k</Code>,{" "}
        <Code>seed</Code>, <Code>stop</Code>), not as serve flags. Temperature{" "}
        <Code>0</Code> is deterministic greedy. See the{" "}
        <DocA href="/docs/api">HTTP API</DocA> reference.
      </DocP>

      <DocH2 id="example">Full example</DocH2>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path /srv/models/llama-70b --context-length 8192 --stream --resident-layers 29 --device gpu --api-key sk-secret --host 0.0.0.0 --port 8000" />
      </div>
      <DocNote>
        Environment variables (<Code>CUDA_PATH</Code>, <Code>HF_TOKEN</Code>, …)
        are documented on <DocA href="/docs/build">Build &amp; features</DocA>.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

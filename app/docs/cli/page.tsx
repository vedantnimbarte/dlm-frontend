import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import { TerminalBlock } from "@/components/TerminalBlock";
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
  title: "CLI reference",
  description:
    "Every dlm subcommand — search, pull, profile, serve, generate, tokenize, doctor — with flags, examples, and output.",
};

export default function Cli() {
  const { prev, next } = docPager("/docs/cli");
  return (
    <>
      <DocTitle>CLI reference</DocTitle>
      <DocLead>
        One binary, seven subcommands. Run <Code>dlm --help</Code> for the
        top-level list, or <Code>dlm &lt;command&gt; --help</Code> for a
        command&rsquo;s full flag set.
      </DocLead>

      <DocTable
        head={["Command", "What it does"]}
        rows={[
          [<Code key="c">search</Code>, "Find models on the Hugging Face hub."],
          [<Code key="c">pull</Code>, "Download a model locally (via curl)."],
          [<Code key="c">profile</Code>, "Compute the VRAM plan — no GPU needed."],
          [<Code key="c">serve</Code>, "Start the OpenAI-compatible HTTP server."],
          [<Code key="c">generate</Code>, "Run the CPU (or GPU) generation loop."],
          [<Code key="c">tokenize</Code>, "Byte-level BPE encode/decode round-trip."],
          [<Code key="c">doctor</Code>, "Check the machine + run a self-test."],
        ]}
      />

      {/* search */}
      <DocH2 id="search">search</DocH2>
      <DocP>
        Search the Hugging Face hub for models — most-downloaded matches first,
        safetensors checkpoints only.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm search llama-3.2" />
      </div>

      {/* pull */}
      <DocH2 id="pull">pull</DocH2>
      <DocP>
        Download a model straight to disk — no <Code>hf</Code> CLI needed. It
        shells out to <Code>curl</Code> (built into Linux, macOS, and Windows
        10/11) to fetch only the files dlm loads: <Code>config.json</Code>,{" "}
        <Code>*.safetensors</Code>, and the tokenizer.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm pull Qwen/Qwen2.5-0.5B-Instruct" />
      </div>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [<Code key="f">--local-dir</Code>, "Change where the model lands (default ./models)."],
          [
            <Code key="f">--token</Code>,
            <>
              Auth for gated/private repos (or set <Code>$HF_TOKEN</Code>).
            </>,
          ],
        ]}
      />
      <DocNote>
        A full HF URL works in place of the <Code>org/model</Code> id. Only
        safetensors checkpoints load — GGUF/PyTorch-only repos are rejected with a
        clear message.
      </DocNote>

      {/* profile */}
      <DocH2 id="profile">profile</DocH2>
      <DocP>
        Do the VRAM budget math and report exactly how many layers stay resident —
        no weights loaded, no GPU required. With no <Code>--model-path</Code> it
        profiles a representative Llama-3-70B-class model against a simulated 16 GB
        card.
      </DocP>
      <div className="mt-5 mb-4">
        <CopyCommand command="dlm profile --model-path /path/to/models/Llama-3-70B-Instruct" />
      </div>
      <TerminalBlock
        command="dlm profile"
        caption="Built-in sample, simulated 16 GB card, Q4 weights, 8,192-token context."
        lines={[
          { text: "  gpu backend  : none (host fallback)", tone: "muted" },
          { text: "  geometry     : 80 layers, hidden 8192, 64 q / 8 kv heads", tone: "muted" },
          { text: "  quantization : Int4 (0.5 bytes/param), ~70.6 B params", tone: "muted" },
          { text: "  ── VRAM PLAN ──────────────────────────────", tone: "text" },
          { text: "    M_free           :  16384.0 MiB", tone: "muted" },
          { text: "    M_safety         :   1536.0 MiB", tone: "pinned" },
          { text: "    M_kv_total       :   2560.0 MiB", tone: "pinned" },
          { text: "    M_layer_weight   :    420.5 MiB", tone: "muted" },
          { text: "    ▶ layers_to_load :     29 / 80", tone: "stream" },
          { text: "    ▶ resident       :     36.2%", tone: "stream" },
          { text: "  ────────────────────────────────────────────", tone: "text" },
          { text: "  swap cycle   : 3 streaming pass(es), window of 29 layer(s)", tone: "compute" },
        ]}
      />
      <DocP>
        See <DocA href="/docs/concepts">Architecture &amp; math</DocA> for how the
        plan is computed.
      </DocP>

      {/* serve */}
      <DocH2 id="serve">serve</DocH2>
      <DocP>
        Start the OpenAI-compatible HTTP server for a model. Concurrent requests
        are continuously batched, and <Code>&quot;stream&quot;: true</Code>{" "}
        streams the reply as Server-Sent Events. Full endpoint details are on the{" "}
        <DocA href="/docs/api">HTTP API</DocA> page.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path /path/to/model --context-length 8192 --port 8000 --host 127.0.0.1" />
      </div>
      <DocTable
        head={["Flag", "Purpose"]}
        rows={[
          [<Code key="f">--model-path</Code>, "Directory with config.json + *.safetensors."],
          [<Code key="f">--port</Code> , "TCP port (default 8000)."],
          [<Code key="f">--host</Code>, "Bind address (default 127.0.0.1)."],
          [<Code key="f">--context-length</Code>, "KV context window in tokens."],
          [
            <Code key="f">--stream [--resident-layers N]</Code>,
            "Layer streaming — hold only a bounded window in memory, materialize the rest on demand.",
          ],
          [<Code key="f">--device gpu</Code>, "Run the batched engine on the CUDA kernel (cuda-kernels build)."],
          [<Code key="f">--api-key</Code>, "Require a bearer token on /v1/*."],
          [<Code key="f">--chat-template</Code>, "plain | chatml | llama3."],
          [<Code key="f">--draft-model-path</Code>, "Enable speculative decoding with a draft model."],
          [<Code key="f">--prefix-cache-size</Code>, "Cache N prompt-prefix KV snapshots so shared prefixes skip re-prefill."],
          [<Code key="f">--multi-gpu-ids</Code>, "Pipeline-parallel across local GPUs, e.g. 0,1,2."],
          [<Code key="f">--distributed-mode</Code>, "master --worker-nodes … coordinates shards; worker serves one shard over TCP."],
        ]}
      />

      {/* generate */}
      <DocH2 id="generate">generate</DocH2>
      <DocP>
        Drive the full generation loop (embedding → transformer stack → LM head →
        sampling) end to end. Point it at a real checkpoint to run on CPU, or pass
        raw ids / text against a synthetic model.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command={`dlm generate --model-path /path/to/small-model --text "Hello"`} />
        <CopyCommand command="dlm generate --prompt 1,2,3 --max-new-tokens 8 --seed 42" />
      </div>
      <DocNote tone="compute">
        On a <Code>cuda-kernels</Code> build, generation runs on the GPU by
        default; <Code>--device cpu</Code> forces the CPU kernel. A CPU-only build
        defaults to CPU, and an explicit <Code>--device gpu</Code> there errors
        clearly.
      </DocNote>

      {/* tokenize */}
      <DocH2 id="tokenize">tokenize</DocH2>
      <DocP>
        Show the byte-level BPE encoder round-trip — encode text to ids and decode
        back.
      </DocP>
      <div className="mt-5 mb-4">
        <CopyCommand command={`dlm tokenize --text "Hello, world!"`} />
      </div>
      <TerminalBlock
        command={`dlm tokenize --text "Hello, world!"`}
        lines={[
          { text: "  ids        : [72, 101, 108, 108, 111, 44, 32, ...]", tone: "muted" },
          { text: '  round-trip : "Hello, world!" (ok)', tone: "stream" },
        ]}
      />

      {/* doctor */}
      <DocH2 id="doctor">doctor</DocH2>
      <DocP>
        Report the GPU backend and free VRAM, run a CPU inference self-check, and —
        on a <Code>cuda-kernels</Code> build with a GPU present — run a live
        CPU-vs-GPU parity probe.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm doctor --model-path /path/to/model" />
      </div>
      <DocUl>
        <DocLi>
          Without <Code>--model-path</Code> it checks the machine and runs the
          self-test only.
        </DocLi>
        <DocLi>
          With it, dlm also confirms the checkpoint loads and tokenizes.
        </DocLi>
      </DocUl>

      <DocPager prev={prev} next={next} />
    </>
  );
}

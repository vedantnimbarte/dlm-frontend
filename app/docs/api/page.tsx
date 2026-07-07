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
  title: "HTTP API",
  description:
    "The OpenAI-compatible server: chat/completions with SSE streaming, sampling parameters, bearer auth, and usage/speculative fields.",
};

export default function Api() {
  const { prev, next } = docPager("/docs/api");
  return (
    <>
      <DocTitle>HTTP API</DocTitle>
      <DocLead>
        <Code>dlm serve</Code> starts a dependency-free, OpenAI-compatible HTTP
        server. Existing clients — Open WebUI, the OpenAI SDKs — point at dlm with
        a URL change and talk to it unchanged.
      </DocLead>

      <DocH2 id="endpoints">Endpoints</DocH2>
      <DocTable
        head={["Method", "Path", "Purpose"]}
        rows={[
          [<Code key="m">POST</Code>, <Code key="p">/v1/chat/completions</Code>, "Chat completion (with optional SSE streaming)."],
          [<Code key="m">POST</Code>, <Code key="p">/v1/completions</Code>, "Text completion."],
          [<Code key="m">GET</Code>, <Code key="p">/v1/models</Code>, "List the served model."],
        ]}
      />

      <DocH2 id="chat">Chat completions</DocH2>
      <DocP>
        Post an OpenAI-shaped request. Add <Code>&quot;stream&quot;: true</Code>{" "}
        to receive the reply token by token as Server-Sent Events.
      </DocP>
      <div className="mt-5 mb-4">
        <CopyCommand command={`curl http://127.0.0.1:8000/v1/chat/completions -H 'Content-Type: application/json' -d '{"model":"dlm","messages":[{"role":"user","content":"Hello"}],"max_tokens":32}'`} />
      </div>
      <TerminalBlock
        command="response"
        lines={[
          { text: '  {"choices":[{"message":{"role":"assistant",', tone: "muted" },
          { text: '     "content":"Hello! How can I help?"}}],', tone: "text" },
          { text: '   "usage":{"completion_tokens":7}}', tone: "muted" },
        ]}
      />

      <DocH2 id="sampling">Sampling parameters</DocH2>
      <DocP>Per-request sampling is honored on both completion endpoints:</DocP>
      <DocTable
        head={["Parameter", "Effect"]}
        rows={[
          [<Code key="p">temperature</Code>, "Softmax temperature. 0 → deterministic greedy."],
          [<Code key="p">top_p</Code>, "Nucleus sampling threshold."],
          [<Code key="p">top_k</Code>, "Top-k sampling cutoff."],
          [<Code key="p">seed</Code>, "Seed the sampler for reproducibility."],
          [<Code key="p">stop</Code>, "Stop sequences that truncate the completion."],
          [<Code key="p">max_tokens</Code>, "Cap the number of generated tokens."],
        ]}
      />

      <DocH2 id="auth">Authentication</DocH2>
      <DocP>
        Start the server with <Code>--api-key</Code> to require a bearer token on
        every <Code>/v1/*</Code> route. The request body is size-capped to guard
        against a hostile <Code>Content-Length</Code>.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm serve --model-path /path/to/model --api-key sk-secret" />
        <CopyCommand command="curl -H 'Authorization: Bearer sk-secret' http://127.0.0.1:8000/v1/models" />
      </div>

      <DocH2 id="tokenizers">Tokenizers & chat templates</DocH2>
      <DocUl>
        <DocLi>
          Real tokenizers load from HF <Code>tokenizer.json</Code> (BPE, with
          special tokens) or <Code>vocab.json</Code> + <Code>merges.txt</Code>.
        </DocLi>
        <DocLi>
          <Code>--chat-template &#123;plain,chatml,llama3&#125;</Code> renders chat
          messages in the model&rsquo;s trained format; control tokens become
          single ids via the special-token vocabulary.
        </DocLi>
      </DocUl>

      <DocH2 id="usage">Usage & speculative stats</DocH2>
      <DocP>
        When the server decodes speculatively (<Code>--draft-model-path</Code>),
        per-request acceptance is surfaced in the OpenAI <Code>usage</Code>{" "}
        response under a <Code>speculative</Code> block:{" "}
        <Code>draft_proposed</Code>, <Code>draft_accepted</Code>,{" "}
        <Code>acceptance_rate</Code>. Streaming responses carry it in a final
        usage-only chunk.
      </DocP>
      <DocNote>
        Concurrent requests are continuously batched by a background scheduler, and
        each request&rsquo;s output is identical to running it alone — independent
        of interleaving. See <DocA href="/docs/concepts">Architecture &amp; math</DocA>.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

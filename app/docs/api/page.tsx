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
    "The dlm server speaks both the OpenAI API (chat/completions, SSE streaming) and the Anthropic Messages API (/v1/messages), with bearer or x-api-key auth.",
};

export default function Api() {
  const { prev, next } = docPager("/docs/api");
  return (
    <>
      <DocTitle>HTTP API</DocTitle>
      <DocLead>
        <Code>dlm serve</Code> starts a dependency-free HTTP server that speaks
        two dialects — the <strong className="text-text">OpenAI API</strong> and
        the <strong className="text-text">Anthropic Messages API</strong>. Point
        either SDK at dlm with a base-URL change and it talks to it unchanged.
      </DocLead>

      <DocH2 id="endpoints">Endpoints</DocH2>
      <DocTable
        head={["Method", "Path", "Purpose"]}
        rows={[
          [<Code key="m">POST</Code>, <Code key="p">/v1/chat/completions</Code>, "OpenAI chat completion (with optional SSE streaming)."],
          [<Code key="m">POST</Code>, <Code key="p">/v1/completions</Code>, "OpenAI text completion."],
          [<Code key="m">POST</Code>, <Code key="p">/v1/messages</Code>, "Anthropic Messages API (non-streaming)."],
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

      <DocH2 id="messages">Anthropic Messages API</DocH2>
      <DocP>
        <Code>POST /v1/messages</Code> accepts an Anthropic-shaped request, so the
        Anthropic SDKs work against dlm. A top-level <Code>system</Code> field is
        folded in as a leading system message, and <Code>content</Code> may be a
        string or a list of text blocks.
      </DocP>
      <div className="mt-5 mb-4">
        <CopyCommand command={`curl http://127.0.0.1:8000/v1/messages -H 'Content-Type: application/json' -H 'x-api-key: dlm' -d '{"model":"dlm","max_tokens":128,"messages":[{"role":"user","content":"Hello"}]}'`} />
      </div>
      <TerminalBlock
        command="response"
        lines={[
          { text: '  {"id":"msg-…","type":"message","role":"assistant",', tone: "muted" },
          { text: '   "model":"dlm",', tone: "muted" },
          { text: '   "content":[{"type":"text","text":"Hello! How can I help?"}],', tone: "text" },
          { text: '   "stop_reason":"max_tokens","stop_sequence":null,', tone: "muted" },
          { text: '   "usage":{"input_tokens":9,"output_tokens":7}}', tone: "muted" },
        ]}
      />
      <DocTable
        head={["Field", "Notes"]}
        rows={[
          [<Code key="f">messages</Code>, "Required. Each content is a string or a list of text blocks."],
          [<Code key="f">max_tokens</Code>, "Anthropic requires it; dlm defaults to the server max if absent."],
          [<Code key="f">system</Code>, "Optional string or blocks — becomes a leading system message."],
          [
            <Code key="f">temperature</Code>,
            <>
              Plus <Code>top_p</Code>, <Code>top_k</Code>,{" "}
              <Code>stop_sequences</Code> — same sampling as the OpenAI path.
            </>,
          ],
        ]}
      />
      <DocNote tone="compute">
        Streaming isn&rsquo;t supported on <Code>/v1/messages</Code> yet — send{" "}
        <Code>&quot;stream&quot;: false</Code> (a streaming request returns 400).
        For token-by-token output, use the OpenAI{" "}
        <Code>/v1/chat/completions</Code> SSE path above. <Code>stop_reason</Code>{" "}
        is <Code>stop_sequence</Code> when a stop is hit, otherwise{" "}
        <Code>max_tokens</Code>.
      </DocNote>

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
        Start the server with <Code>--api-key</Code> to require a key on every{" "}
        <Code>/v1/*</Code> route. Both header styles are accepted —{" "}
        <Code>Authorization: Bearer &lt;key&gt;</Code> (OpenAI) or{" "}
        <Code>x-api-key: &lt;key&gt;</Code> (Anthropic) — so either SDK
        authenticates unchanged. The request body is size-capped to guard against
        a hostile <Code>Content-Length</Code>.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm serve --model-path /path/to/model --api-key sk-secret" />
        <CopyCommand command="curl -H 'Authorization: Bearer sk-secret' http://127.0.0.1:8000/v1/models" />
        <CopyCommand command="curl -H 'x-api-key: sk-secret' http://127.0.0.1:8000/v1/models" />
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

import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import { TerminalBlock } from "@/components/TerminalBlock";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocH3,
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
          [<Code key="m">POST</Code>, <Code key="p">/v1/messages</Code>, "Anthropic Messages API (with SSE streaming)."],
          [<Code key="m">POST</Code>, <Code key="p">/v1/messages/count_tokens</Code>, "Count tokens for an Anthropic-shaped request without generating."],
          [<Code key="m">GET</Code>, <Code key="p">/v1/models</Code>, "List the served model."],
          [<Code key="m">GET</Code>, <Code key="p">/metrics</Code>, "Prometheus counters — requests and prompt/completion tokens."],
          [<Code key="m">GET</Code>, <Code key="p">/health</Code>, "Liveness check (also GET /). Open — no auth."],
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
          { text: '  {"id":"chatcmpl-…","object":"chat.completion","model":"dlm",', tone: "muted" },
          { text: '   "choices":[{"index":0,"message":{"role":"assistant",', tone: "muted" },
          { text: '     "content":"Hello! How can I help?"},', tone: "text" },
          { text: '     "finish_reason":"stop"}],', tone: "muted" },
          { text: '   "usage":{"prompt_tokens":9,"completion_tokens":7,', tone: "muted" },
          { text: '     "total_tokens":16}}', tone: "muted" },
        ]}
      />
      <DocH3 id="chat-fields">Request fields</DocH3>
      <DocTable
        head={["Field", "Notes"]}
        rows={[
          [<Code key="f">model</Code>, "Any string — dlm serves one model; the id is echoed back."],
          [<Code key="f">messages</Code>, "Required. Array of { role, content } turns, rendered with the server's chat template."],
          [<Code key="f">max_tokens</Code>, "Cap on generated tokens (defaults to the server max)."],
          [<Code key="f">stream</Code>, "true → SSE chunks; false (default) → one JSON response."],
          [
            <Code key="f">temperature</Code>,
            <>
              Plus <Code>top_p</Code>, <Code>top_k</Code>, <Code>min_p</Code>,{" "}
              <Code>repetition_penalty</Code>, <Code>seed</Code>, <Code>stop</Code>{" "}
              — see Sampling parameters below.
            </>,
          ],
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
      <DocH3 id="messages-streaming">Streaming</DocH3>
      <DocP>
        Set <Code>&quot;stream&quot;: true</Code> to stream the reply as Server-Sent
        Events, following the sequence Anthropic clients expect:
      </DocP>
      <DocUl>
        <DocLi>
          <Code>message_start</Code> — the opening message envelope.
        </DocLi>
        <DocLi>
          <Code>content_block_start</Code> — an empty text block at index 0.
        </DocLi>
        <DocLi>
          <Code>content_block_delta</Code> — a run of <Code>text_delta</Code>{" "}
          events, one per token.
        </DocLi>
        <DocLi>
          <Code>content_block_stop</Code> — the text block closes.
        </DocLi>
        <DocLi>
          <Code>message_delta</Code> — the final <Code>stop_reason</Code> and{" "}
          <Code>output_tokens</Code>.
        </DocLi>
        <DocLi>
          <Code>message_stop</Code> — the stream ends.
        </DocLi>
      </DocUl>
      <DocNote>
        Each frame carries both an <Code>event:</Code> and a <Code>data:</Code>{" "}
        line. <Code>stop_reason</Code> is <Code>stop_sequence</Code> when a stop is
        hit, otherwise <Code>max_tokens</Code>.
      </DocNote>

      <DocH2 id="sampling">Sampling parameters</DocH2>
      <DocP>
        Per-request sampling is honored on both the chat and messages endpoints:
      </DocP>
      <DocTable
        head={["Parameter", "Effect"]}
        rows={[
          [<Code key="p">temperature</Code>, "Softmax temperature. 0 → deterministic greedy."],
          [<Code key="p">top_p</Code>, "Nucleus sampling threshold."],
          [<Code key="p">top_k</Code>, "Top-k sampling cutoff."],
          [<Code key="p">min_p</Code>, "Min-p truncation — drop tokens below a fraction of the top probability."],
          [<Code key="p">repetition_penalty</Code>, "Penalize already-generated tokens to curb loops."],
          [<Code key="p">seed</Code>, "Seed the sampler for reproducibility."],
          [<Code key="p">stop</Code>, "Stop sequences that truncate the completion."],
          [<Code key="p">max_tokens</Code>, "Cap the number of generated tokens."],
        ]}
      />

      <DocH2 id="models">List models</DocH2>
      <DocP>
        <Code>GET /v1/models</Code> returns the single served model in the OpenAI
        list shape.
      </DocP>
      <div className="mt-5 mb-4">
        <CopyCommand command="curl http://127.0.0.1:8000/v1/models" />
      </div>
      <TerminalBlock
        command="response"
        lines={[
          { text: '  {"object":"list","data":[{"id":"dlm",', tone: "muted" },
          { text: '     "object":"model","owned_by":"dlm"}]}', tone: "text" },
        ]}
      />

      <DocH2 id="metrics">Metrics</DocH2>
      <DocP>
        <Code>GET /metrics</Code> exposes Prometheus-format counters — scrape it
        with any Prometheus-compatible collector. Every request is also written to
        an access log on stderr (<Code>METHOD PATH → status (Nms)</Code>).
      </DocP>
      <DocTable
        head={["Counter", "Meaning"]}
        rows={[
          [<Code key="c">dlm_requests_total</Code>, "Requests served."],
          [<Code key="c">dlm_prompt_tokens_total</Code>, "Prompt tokens processed."],
          [<Code key="c">dlm_completion_tokens_total</Code>, "Completion tokens generated."],
        ]}
      />

      <DocH2 id="errors">Errors</DocH2>
      <DocP>
        Failures return a JSON error body with the appropriate status code. See
        the <DocA href="/docs/errors">Errors &amp; status codes</DocA> reference
        for the full list.
      </DocP>

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

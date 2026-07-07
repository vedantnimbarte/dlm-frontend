import type { Metadata } from "next";
import { TerminalBlock } from "@/components/TerminalBlock";
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
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Editor integrations",
  description:
    "Use dlm as the model backend for AI coding editors — Cursor, Continue.dev, Aider, and Zed — by pointing their OpenAI-compatible base URL at the server.",
};

export default function Editors() {
  const { prev, next } = docPager("/docs/editors");
  return (
    <>
      <DocTitle>Editor integrations</DocTitle>
      <DocLead>
        AI coding editors that accept a custom OpenAI base URL can run on dlm —
        keep your code and your model on your own hardware. In each, set the base
        URL to <Code>http://localhost:8000/v1</Code> and the model to{" "}
        <Code>dlm</Code>.
      </DocLead>

      <DocNote>
        Start the server first with a chat-capable model — see{" "}
        <DocA href="/docs/recommended-models">Recommended models</DocA> — and
        leave it running: <Code>dlm serve --model-path ./models/your-model</Code>.
      </DocNote>

      <DocH2 id="cursor">Cursor</DocH2>
      <DocP>
        In <strong className="text-text">Settings → Models</strong>, enable a
        custom OpenAI API key, set the base URL to your dlm server, and add{" "}
        <Code>dlm</Code> as a model. Cursor sends OpenAI-shaped requests to{" "}
        <Code>/v1/chat/completions</Code>.
      </DocP>

      <DocH2 id="continue">Continue.dev</DocH2>
      <DocP>
        Add dlm as an OpenAI-compatible provider in{" "}
        <Code>~/.continue/config.json</Code>:
      </DocP>
      <TerminalBlock
        command="~/.continue/config.json"
        lines={[
          { text: '  "models": [{', tone: "muted" },
          { text: '    "title": "dlm",', tone: "text" },
          { text: '    "provider": "openai",', tone: "stream" },
          { text: '    "model": "dlm",', tone: "text" },
          { text: '    "apiBase": "http://localhost:8000/v1",', tone: "stream" },
          { text: '    "apiKey": "dlm"', tone: "muted" },
          { text: "  }]", tone: "muted" },
        ]}
      />

      <DocH2 id="aider">Aider</DocH2>
      <DocP>
        Aider speaks the OpenAI API — point it at dlm with environment variables:
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="export OPENAI_API_BASE=http://localhost:8000/v1" />
        <CopyCommand command="export OPENAI_API_KEY=dlm" />
        <CopyCommand command="aider --model openai/dlm" />
      </div>

      <DocH2 id="zed">Zed</DocH2>
      <DocP>
        In Zed&rsquo;s assistant settings, add an OpenAI-compatible provider with
        an <Code>api_url</Code> of <Code>http://localhost:8000/v1</Code> and the
        model <Code>dlm</Code>.
      </DocP>

      <DocH2 id="anthropic-tools">Anthropic-based tools</DocH2>
      <DocUl>
        <DocLi>
          Tools that target the Anthropic API can use dlm&rsquo;s{" "}
          <Code>/v1/messages</Code> endpoint instead — set the Anthropic base URL
          to <Code>http://localhost:8000</Code> and use <Code>x-api-key</Code>.
        </DocLi>
        <DocLi>
          See <DocA href="/docs/clients">Client integration</DocA> for the SDK
          details behind these editors.
        </DocLi>
      </DocUl>

      <DocPager prev={prev} next={next} />
    </>
  );
}

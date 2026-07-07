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
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Client integration",
  description:
    "Point the OpenAI Python/Node SDKs, curl, Open WebUI, and LangChain at a running dlm server with a base-URL change.",
};

export default function Clients() {
  const { prev, next } = docPager("/docs/clients");
  return (
    <>
      <DocTitle>Client integration</DocTitle>
      <DocLead>
        Because <Code>dlm serve</Code> speaks both the OpenAI API and the
        Anthropic Messages API, clients for either work unchanged — point the base
        URL at dlm and set the model to <Code>dlm</Code>.
      </DocLead>

      <DocH2 id="connection">Connection details</DocH2>
      <DocUl>
        <DocLi>
          <strong className="text-text">Base URL</strong> —{" "}
          <Code>http://127.0.0.1:8000/v1</Code> (host/port from your{" "}
          <Code>--host</Code> / <Code>--port</Code> flags).
        </DocLi>
        <DocLi>
          <strong className="text-text">Model</strong> — <Code>dlm</Code>.
        </DocLi>
        <DocLi>
          <strong className="text-text">API key</strong> — any value unless the
          server was started with <Code>--api-key</Code>, in which case it must
          match.
        </DocLi>
      </DocUl>

      <DocH2 id="python">Python (openai SDK)</DocH2>
      <div className="mt-5 mb-4">
        <CopyCommand command="pip install openai" />
      </div>
      <TerminalBlock
        command="python"
        lines={[
          { text: "  from openai import OpenAI", tone: "text" },
          { text: "  client = OpenAI(", tone: "text" },
          { text: '      base_url="http://127.0.0.1:8000/v1",', tone: "stream" },
          { text: '      api_key="dlm",', tone: "muted" },
          { text: "  )", tone: "text" },
          { text: "  resp = client.chat.completions.create(", tone: "text" },
          { text: '      model="dlm",', tone: "muted" },
          { text: '      messages=[{"role": "user", "content": "Hello"}],', tone: "text" },
          { text: "  )", tone: "text" },
          { text: "  print(resp.choices[0].message.content)", tone: "text" },
        ]}
      />
      <DocNote>
        Pass <Code>stream=True</Code> to iterate tokens as they arrive — dlm sends
        them as Server-Sent Events.
      </DocNote>

      <DocH2 id="node">Node (openai SDK)</DocH2>
      <TerminalBlock
        command="node"
        lines={[
          { text: '  import OpenAI from "openai";', tone: "text" },
          { text: "  const client = new OpenAI({", tone: "text" },
          { text: '    baseURL: "http://127.0.0.1:8000/v1",', tone: "stream" },
          { text: '    apiKey: "dlm",', tone: "muted" },
          { text: "  });", tone: "text" },
          { text: "  const r = await client.chat.completions.create({", tone: "text" },
          { text: '    model: "dlm",', tone: "muted" },
          { text: '    messages: [{ role: "user", content: "Hello" }],', tone: "text" },
          { text: "  });", tone: "text" },
        ]}
      />

      <DocH2 id="curl">curl</DocH2>
      <div className="mt-5">
        <CopyCommand command={`curl http://127.0.0.1:8000/v1/chat/completions -H 'Content-Type: application/json' -d '{"model":"dlm","messages":[{"role":"user","content":"Hello"}]}'`} />
      </div>

      <DocH2 id="open-webui">Open WebUI</DocH2>
      <DocP>
        In <strong className="text-text">Settings → Connections</strong>, add an
        OpenAI API connection with the base URL{" "}
        <Code>http://127.0.0.1:8000/v1</Code> and any API key. The{" "}
        <Code>dlm</Code> model appears in the model picker.
      </DocP>

      <DocH2 id="langchain">LangChain</DocH2>
      <TerminalBlock
        command="python"
        lines={[
          { text: "  from langchain_openai import ChatOpenAI", tone: "text" },
          { text: "  llm = ChatOpenAI(", tone: "text" },
          { text: '      base_url="http://127.0.0.1:8000/v1",', tone: "stream" },
          { text: '      api_key="dlm",', tone: "muted" },
          { text: '      model="dlm",', tone: "muted" },
          { text: "  )", tone: "text" },
          { text: '  print(llm.invoke("Hello").content)', tone: "text" },
        ]}
      />
      <DocP>
        See the <DocA href="/docs/api">HTTP API</DocA> reference for the full set
        of endpoints, sampling parameters, and usage fields.
      </DocP>

      <DocH2 id="anthropic">Anthropic SDK</DocH2>
      <DocP>
        dlm also serves the Anthropic Messages API at{" "}
        <Code>/v1/messages</Code>, so the <Code>anthropic</Code> SDK works too —
        set its base URL to the dlm server and use <Code>x-api-key</Code> for
        auth. Streaming isn&rsquo;t supported on this path yet.
      </DocP>
      <div className="mt-5 mb-4">
        <CopyCommand command="pip install anthropic" />
      </div>
      <TerminalBlock
        command="python"
        lines={[
          { text: "  from anthropic import Anthropic", tone: "text" },
          { text: "  client = Anthropic(", tone: "text" },
          { text: '      base_url="http://127.0.0.1:8000",', tone: "stream" },
          { text: '      api_key="dlm",', tone: "muted" },
          { text: "  )", tone: "text" },
          { text: "  msg = client.messages.create(", tone: "text" },
          { text: '      model="dlm",', tone: "muted" },
          { text: "      max_tokens=128,", tone: "text" },
          { text: '      messages=[{"role": "user", "content": "Hello"}],', tone: "text" },
          { text: "  )", tone: "text" },
          { text: "  print(msg.content[0].text)", tone: "text" },
        ]}
      />
      <DocNote>
        The Anthropic SDK appends <Code>/v1/messages</Code> to the base URL, so set{" "}
        <Code>base_url</Code> to the server root (no <Code>/v1</Code>). See the{" "}
        <DocA href="/docs/api">HTTP API</DocA> reference for the request and
        response shapes.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

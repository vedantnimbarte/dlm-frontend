import type { Metadata } from "next";
import { TerminalBlock } from "@/components/TerminalBlock";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  Code,
  DocA,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Errors & status codes",
  description:
    "The HTTP status codes and JSON error shape the dlm server returns — invalid requests, auth failures, and body limits.",
};

export default function Errors() {
  const { prev, next } = docPager("/docs/errors");
  return (
    <>
      <DocTitle>Errors &amp; status codes</DocTitle>
      <DocLead>
        Every failure returns a JSON error body with an appropriate status code,
        in the same shape the OpenAI and Anthropic clients expect.
      </DocLead>

      <DocH2 id="shape">Error shape</DocH2>
      <TerminalBlock
        command="error"
        lines={[
          { text: "  {", tone: "muted" },
          { text: '    "error": {', tone: "text" },
          { text: '      "message": "messages must not be empty",', tone: "text" },
          { text: '      "type": "invalid_request_error"', tone: "muted" },
          { text: "    }", tone: "text" },
          { text: "  }", tone: "muted" },
        ]}
      />

      <DocH2 id="codes">Status codes</DocH2>
      <DocTable
        head={["Code", "Meaning", "When"]}
        rows={[
          [<Code key="c">200</Code>, "OK", "The request succeeded."],
          [
            <Code key="c">400</Code>,
            "Invalid request",
            <>
              Malformed JSON, empty <Code>messages</Code>, a prompt that
              won&rsquo;t encode, or streaming on a path that doesn&rsquo;t
              support it.
            </>,
          ],
          [
            <Code key="c">401</Code>,
            "Unauthorized",
            <>
              <Code>--api-key</Code> is set and the request&rsquo;s{" "}
              <Code>Authorization: Bearer</Code> / <Code>x-api-key</Code> header
              is missing or wrong.
            </>,
          ],
          [<Code key="c">404</Code>, "No such endpoint", "The path isn't one of the served routes."],
          [<Code key="c">405</Code>, "Method not allowed", "Wrong HTTP method for the route."],
          [
            <Code key="c">413</Code>,
            "Payload too large",
            <>
              The request body exceeds the 16 MiB cap (a guard against a hostile{" "}
              <Code>Content-Length</Code>).
            </>,
          ],
        ]}
      />

      <DocP>
        Auth applies to every route — including <Code>GET /metrics</Code> — except{" "}
        <Code>GET /</Code>, <Code>GET /health</Code> and <Code>GET /healthz</Code>,
        which stay open for liveness checks. See{" "}
        <DocA href="/docs/deployment">Deployment &amp; security</DocA> for auth
        setup and <DocA href="/docs/troubleshooting">Troubleshooting</DocA> for
        fixes.
      </DocP>

      <DocPager prev={prev} next={next} />
    </>
  );
}

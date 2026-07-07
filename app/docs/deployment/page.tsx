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
  title: "Deployment & security",
  description:
    "Run dlm serve in production — bearer-token auth, bind address, the request body cap, and terminating TLS at a reverse proxy.",
};

export default function Deployment() {
  const { prev, next } = docPager("/docs/deployment");
  return (
    <>
      <DocTitle>Deployment &amp; security</DocTitle>
      <DocLead>
        <Code>dlm serve</Code> is a plain HTTP server. In production, require a
        token, bind deliberately, and terminate TLS at a proxy in front of it.
      </DocLead>

      <DocH2 id="auth">Authentication</DocH2>
      <DocP>
        Pass <Code>--api-key</Code> to require a bearer token on every{" "}
        <Code>/v1/*</Code> route. Requests without a matching{" "}
        <Code>Authorization: Bearer …</Code> header are rejected.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm serve --model-path /path/to/model --api-key sk-secret" />
        <CopyCommand command="curl -H 'Authorization: Bearer sk-secret' http://127.0.0.1:8000/v1/models" />
      </div>

      <DocH2 id="bind">Bind address</DocH2>
      <DocUl>
        <DocLi>
          <Code>--host 127.0.0.1</Code> (default) keeps the server local to the
          machine.
        </DocLi>
        <DocLi>
          <Code>--host 0.0.0.0</Code> exposes it on the network — only do this
          behind a firewall or proxy, and always with <Code>--api-key</Code>.
        </DocLi>
      </DocUl>

      <DocH2 id="hardening">Built-in hardening</DocH2>
      <DocUl>
        <DocLi>
          The request body is <strong className="text-text">size-capped</strong>{" "}
          to guard against a hostile <Code>Content-Length</Code>.
        </DocLi>
        <DocLi>
          Bearer auth covers all <Code>/v1/*</Code> endpoints when enabled.
        </DocLi>
      </DocUl>

      <DocH2 id="tls">TLS via a reverse proxy</DocH2>
      <DocP>
        dlm serves plain HTTP — it has no built-in TLS. Terminate HTTPS at a
        reverse proxy (Caddy, nginx) and forward to dlm on localhost.
      </DocP>
      <TerminalBlock
        command="Caddyfile"
        lines={[
          { text: "  api.example.com {", tone: "text" },
          { text: "      reverse_proxy 127.0.0.1:8000", tone: "stream" },
          { text: "  }", tone: "text" },
        ]}
      />

      <DocH2 id="service">Run it as a service</DocH2>
      <DocP>
        A minimal systemd unit keeps the server running and restarts it on
        failure:
      </DocP>
      <TerminalBlock
        command="/etc/systemd/system/dlm.service"
        lines={[
          { text: "  [Service]", tone: "muted" },
          { text: "  ExecStart=/home/USER/.local/bin/dlm serve \\", tone: "text" },
          { text: "      --model-path /srv/models/model --api-key sk-secret", tone: "stream" },
          { text: "  Restart=on-failure", tone: "text" },
          { text: "  [Install]", tone: "muted" },
          { text: "  WantedBy=multi-user.target", tone: "text" },
        ]}
      />
      <DocNote>
        Validate the box before going live with{" "}
        <DocA href="/docs/cli">dlm doctor</DocA> — it checks the GPU backend, free
        VRAM, and that the checkpoint loads.
      </DocNote>

      <DocPager prev={prev} next={next} />
    </>
  );
}

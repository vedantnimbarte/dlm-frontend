import { DOCS_NAV } from "@/components/docsNav";

export const dynamic = "force-static";

const SITE = "https://dlm.dev";

// llms.txt — a plain-text map of the site for LLMs and crawlers.
// https://llmstxt.org/
export function GET() {
  const lines: string[] = [
    "# dlm",
    "",
    "> dlm (Dynamic LLM) is an open-source Rust inference engine that streams",
    "> transformer layers in and out of VRAM as it computes, so a 70B model runs",
    "> on 16 GB of consumer VRAM. It serves an OpenAI- and Anthropic-compatible",
    "> HTTP API.",
    "",
    "## Pages",
    `- [Home](${SITE}/)`,
    `- [How it works](${SITE}/how-it-works)`,
    `- [Benchmarks](${SITE}/benchmarks)`,
    `- [Get started](${SITE}/get-started)`,
    `- [About](${SITE}/about)`,
    "",
    "## Docs",
  ];

  for (const group of DOCS_NAV) {
    lines.push(`### ${group.group}`);
    for (const item of group.items) {
      const url = item.external ? item.href : `${SITE}${item.href}`;
      lines.push(`- [${item.label}](${url})`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

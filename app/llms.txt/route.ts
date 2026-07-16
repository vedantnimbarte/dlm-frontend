import { DOCS_NAV } from "@/components/docsNav";
import { SITE_URL as SITE } from "@/lib/site";

export const dynamic = "force-static";

// llms.txt — a plain-text map of the site for LLMs and crawlers.
// https://llmstxt.org/
export function GET() {
  const lines: string[] = [
    "# dlm",
    "",
    "> dlm (Dynamic LLM) is an open-source Rust inference engine for running",
    "> models bigger than your VRAM, on whatever card you have — 4, 6, 8, 16 GB",
    "> or more. `--quant int4|int8` quantizes the weights at load so more of the",
    "> model stays resident; whatever still doesn't fit is streamed through a",
    "> bounded window of layers. It serves an OpenAI- and Anthropic-compatible",
    "> HTTP API.",
    "",
    "## Pages",
    `- [Home](${SITE}/)`,
    `- [How it works](${SITE}/how-it-works)`,
    `- [Benchmarks](${SITE}/benchmarks)`,
    `- [VRAM calculator](${SITE}/calculator)`,
    `- [Models](${SITE}/models)`,
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

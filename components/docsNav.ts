// Single source of truth for the docs IA — the sidebar renders these groups,
// each page derives its prev/next pager from the flattened internal order, and
// the ⌘K search indexes label + keywords.

export interface DocLink {
  href: string;
  label: string;
  external?: boolean;
  keywords?: string;
}

export const DOCS_NAV: { group: string; items: DocLink[] }[] = [
  {
    group: "Get started",
    items: [
      { href: "/docs", label: "Overview", keywords: "intro quickstart install" },
      { href: "/get-started", label: "Get started walkthrough", keywords: "walkthrough guided first run quickstart install pull serve doctor debug troubleshooting issues errors new user" },
      { href: "/docs/install", label: "Installation", keywords: "curl cargo build rust cuda rocm setup" },
      { href: "/docs/recommended-models", label: "Recommended models", keywords: "pull huggingface llama qwen mistral gguf models gallery" },
    ],
  },
  {
    group: "Guides",
    items: [
      { href: "/docs/clients", label: "Client integration", keywords: "openai anthropic sdk python node curl langchain open webui base url" },
      { href: "/docs/editors", label: "Editor integrations", keywords: "cursor continue aider zed vscode copilot ide" },
      { href: "/docs/tutorials", label: "Cookbook", keywords: "recipes tutorial examples 70b team speculative walkthrough" },
      { href: "/docs/distributed", label: "Distributed & multi-GPU", keywords: "multi-gpu pipeline worker coordinator shard speculative streaming" },
      { href: "/docs/performance", label: "Performance tuning", keywords: "tok/s throughput resident layers pcie nvme cache batching context prefetch prefetch-depth auto-prefetch kv-quant int8 int4 kv" },
      { href: "/docs/deployment", label: "Deployment & security", keywords: "production api-key auth tls reverse proxy systemd bind host" },
      { href: "/docs/troubleshooting", label: "Troubleshooting", keywords: "error oom won't fit gguf token cuda doctor faq bug" },
    ],
  },
  {
    group: "Reference",
    items: [
      { href: "/docs/cli", label: "CLI reference", keywords: "search pull profile serve generate tokenize doctor commands flags" },
      { href: "/docs/config", label: "serve configuration", keywords: "serve flags options context-length resident-layers device chat-template prefetch-depth auto-prefetch kv-quant int4 int8 prefix-cache" },
      { href: "/docs/api", label: "HTTP API", keywords: "openai anthropic endpoints chat completions messages models sampling sse streaming auth metrics prometheus health count_tokens min_p repetition_penalty" },
      { href: "/docs/errors", label: "Errors & status codes", keywords: "400 401 404 405 error json status codes" },
      { href: "/docs/models", label: "Model support", keywords: "safetensors gptq quantization tokenizer architecture llama formats" },
      { href: "/docs/quantization", label: "Quantization", keywords: "gptq awq int4 q4 4-bit dequant precision f16 bf16" },
      { href: "/docs/build", label: "Build & features", keywords: "cargo features cuda rocm env vars device distributed" },
      { href: "/docs/library", label: "Rust library", keywords: "crate coordinator partition_layers computekernel modules cargo" },
      { href: "/docs/glossary", label: "Glossary", keywords: "terms definitions zone kv gqa rope swiglu" },
    ],
  },
  {
    group: "Concepts",
    items: [
      { href: "/docs/concepts", label: "Architecture & math", keywords: "zones streaming a/b schedule layerstoload formula kernels" },
    ],
  },
  {
    group: "Project",
    items: [
      { href: "/docs/contributing", label: "Contributing", keywords: "build test feature flags parity codebase pull request" },
      { href: "/docs/changelog", label: "Changelog", keywords: "releases version history notes" },
    ],
  },
];

// Reading order for the prev/next pager — internal pages only.
export const DOCS_ORDER: DocLink[] = DOCS_NAV.flatMap((g) =>
  g.items.filter((l) => !l.external)
);

export function docPager(href: string): { prev?: DocLink; next?: DocLink } {
  const i = DOCS_ORDER.findIndex((l) => l.href === href);
  return {
    prev: i > 0 ? DOCS_ORDER[i - 1] : undefined,
    next: i >= 0 && i < DOCS_ORDER.length - 1 ? DOCS_ORDER[i + 1] : undefined,
  };
}

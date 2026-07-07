// Single source of truth for the docs IA — the sidebar renders these groups,
// and each page derives its prev/next pager from the flattened internal order.

export interface DocLink {
  href: string;
  label: string;
  external?: boolean;
}

export const DOCS_NAV: { group: string; items: DocLink[] }[] = [
  {
    group: "Get started",
    items: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/install", label: "Installation" },
    ],
  },
  {
    group: "Guides",
    items: [
      { href: "/docs/clients", label: "Client integration" },
      { href: "/docs/distributed", label: "Distributed & multi-GPU" },
      { href: "/docs/performance", label: "Performance tuning" },
      { href: "/docs/deployment", label: "Deployment & security" },
      { href: "/docs/troubleshooting", label: "Troubleshooting" },
    ],
  },
  {
    group: "Reference",
    items: [
      { href: "/docs/cli", label: "CLI reference" },
      { href: "/docs/config", label: "serve configuration" },
      { href: "/docs/api", label: "HTTP API" },
      { href: "/docs/models", label: "Model support" },
      { href: "/docs/build", label: "Build & features" },
      { href: "/docs/library", label: "Rust library" },
      { href: "/docs/glossary", label: "Glossary" },
    ],
  },
  {
    group: "Concepts",
    items: [{ href: "/docs/concepts", label: "Architecture & math" }],
  },
  {
    group: "Project",
    items: [{ href: "/docs/contributing", label: "Contributing" }],
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

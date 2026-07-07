# dlm website

The marketing and documentation site for [**dlm**](https://github.com/vedantnimbarte/dlm) — a Rust inference engine that streams transformer layers through VRAM so a 70B model runs on 16 GB of consumer VRAM.

Built with the Next.js App Router, TypeScript, and Tailwind — a dark, liquid-glass design system with a live Hugging Face model browser and a full documentation section.

## Stack

- **[Next.js](https://nextjs.org/) 15** (App Router, React 19)
- **TypeScript 5**
- **Tailwind CSS 3**
- Route handlers for the Hugging Face proxy (no external UI dependencies)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with `next lint` |

> `pnpm` works too — the repo carries a `pnpm-lock.yaml` alongside `package-lock.json`.

## Project structure

```
app/
  page.tsx              Home
  how-it-works/         Deep dive: zones, A/B schedule, budget math, kernels
  benchmarks/           VRAM × model matrix + interactive profiler
  get-started/          Install, quickstart, OS/GPU tabs
  models/               Live Hugging Face model browser
  blog/                 Blog index + posts
  about/                Naming story, phase timeline
  docs/                 Multi-page docs (sidebar, ⌘K search, on-this-page TOC)
    layout.tsx          Docs shell (Nav + sidebar + TOC + Footer)
    <section>/page.tsx  One file per docs page
  api/
    hf-models/          Proxy: search the HF hub (server-side, cached)
    hf-providers/       Proxy: top ~50 hub authors for the provider dropdown
  llms.txt/             Generated llms.txt route
  opengraph-image.tsx   Branded OG image (next/og)
  not-found.tsx         Custom 404
  sitemap.ts, robots.ts
components/             Presentational + interactive components
  docsNav.ts            Single source of truth for the docs IA
  DocsContent.tsx       Doc primitives (headings, tables, notes, pager)
  ...
```

## Notable features

- **Docs** — a multi-page section driven by a single IA source (`components/docsNav.ts`): a persistent sidebar, ⌘K command-palette search, an on-this-page TOC with scroll-spy, and prev/next paging. Covers the CLI, the OpenAI + Anthropic HTTP API, build/config, concepts, and guides.
- **Models browser** (`/models`) — searches the Hugging Face hub live and gives each result a ready-to-run `dlm pull <id>` command. Provider chips + a searchable provider combobox are seeded from the hub. Search is proxied server-side (`/api/hf-models`, `/api/hf-providers`) to avoid CORS and cache results.
- **Report a bug** — opens a prefilled GitHub issue, no backend or token required.
- **Polish** — live GitHub star count, a comparison table, an animated terminal demo, `llms.txt`, an OG image, and a themed 404.

## Design system

Tokens live in `app/globals.css` (colors, glass surfaces, aurora background) and `tailwind.config.ts`. The look is a near-black canvas with frosted-glass panels, a monospace utility face for data/labels, and three semantic accents — teal (streaming), amber (compute), indigo (pinned) — reserved for data-viz, never chrome.

## Deployment notes

The Hugging Face proxy routes (`/api/hf-*`) are dynamic route handlers, so the site needs a **server runtime** (e.g. Vercel/Node) — it is **not** a static export. Everything else prerenders to static.

## License

Apache-2.0, matching the [dlm](https://github.com/vedantnimbarte/dlm) engine.

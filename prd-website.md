# PRD — flip Marketing Website

**Product:** `flip` — Dynamic Layer-Streaming LLM Inference Engine
**Deliverable:** Public marketing / landing website
**Owner:** marketing@cloudairy.com
**Date:** 2026-07-02
**Status:** Draft v1

---

## 1. Overview

### 1.1 What we're building
A marketing website for **flip**, an open-source Rust inference engine that runs massive LLMs (70B, 405B+) on consumer GPUs (e.g. 16 GB VRAM) by *streaming* transformer layers in and out of VRAM instead of resident-loading the whole model. The core mechanic — continuously "flipping" the next window of layers in over the PCIe bus while the GPU computes the current one — is both the product name and the story the site must tell.

This is **not** the product UI. It is a conversion-and-credibility site whose job is to make a technical audience understand the idea in 10 seconds, believe it works, and take one action (star the repo / read the docs / try the CLI).

### 1.2 The single job of the site
> Convince a technically literate visitor that they can run a 70B model on the GPU they already own — and get them to `git clone` or star the repo.

Every page and section is measured against that sentence.

### 1.3 Scope
| In scope | Out of scope (v1) |
|---|---|
| Marketing landing (home) | Auth / user accounts |
| Features / How-it-works deep dive | Full hosted documentation site (link out to repo README/`specs.md`) |
| Interactive VRAM-budget visualizer (hero signature) | Blog CMS (static MDX posts only, optional) |
| Benchmarks / performance page | E-commerce / paid plans (product is OSS) |
| Get-started / install page | Dashboard or web-based inference playground |
| About / roadmap | Localization (English only at launch) |

---

## 2. Goals & Success Metrics

### 2.1 Goals
1. Explain a non-obvious systems idea (layer streaming) fast and correctly.
2. Establish technical credibility with a skeptical developer audience.
3. Drive repo engagement and install attempts.

### 2.2 Success metrics
| Metric | Target (90 days post-launch) |
|---|---|
| Homepage → "Get started" / repo CTR | ≥ 8% |
| Median time-to-first-meaningful-paint | < 1.5s (4G, mid-tier mobile) |
| Lighthouse: Performance / Accessibility / SEO | ≥ 95 each |
| Bounce rate (homepage) | < 45% |
| Docs/README outbound clicks per session | ≥ 0.4 |

---

## 3. Audience & Personas

Derived from the product PRD:

- **Local AI Developer** — wants to run Llama-3 70B / DeepSeek R1 locally without cloud API fees. Cares about: "will it run on *my* 16 GB card, and how fast?" Primary persona; the hero speaks to them.
- **Privacy-First Enterprise** — needs air-gapped inference on sensitive data. Cares about: local-only, zero cloud dependency, reliability (no OOM).
- **Resource-Constrained Research Team** — runs benchmarks across mixed hardware. Cares about: multi-GPU/multi-node scaling, reproducible numbers, correctness.

Tone for all three: **peer-to-peer, technically honest, no hype.** This audience punishes marketing fluff. Show the math, show the CLI, show real output.

---

## 4. Information Architecture

```
/                     Home (hero + the full story on one scroll)
/how-it-works         Deep dive: pinned/streaming/cache zones, double-buffering, VRAM math
/benchmarks           Performance targets & measured numbers, hardware matrix
/get-started          Install, prerequisites, first `profile` / `serve` run
/about                Story, roadmap (Phase 1→3), license, links
  (footer)            GitHub, specs.md, PRD, Apache-2.0 license, contact
```

Global nav (persistent, top): `flip` wordmark · How it works · Benchmarks · Get started · GitHub ★ (with live star count if feasible, static fallback).

---

## 5. Page-by-Page Specification

### 5.1 Home
The whole argument lives on one vertical scroll. Sections, in order:

1. **Hero (signature).** Headline states the impossible-sounding claim; subhead explains the mechanic in one line; primary CTA `Get started`, secondary `View on GitHub`. Accompanied by the **live VRAM-budget visualizer** (see §7).
   - Headline: *"Run a 70B model on 16 GB of VRAM."*
   - Subhead: *"flip streams transformer layers in and out of your GPU as it computes — so model size stops being a hardware wall."*
2. **The problem.** Short: resident-loading a 70B model needs ~40 GB+; consumer cards have 16. Contrast block with a single stat.
3. **The mechanic ("How the flip works").** Animated three-zone VRAM diagram — **Pinned / Streaming (A·B double buffer) / Cache** — reproducing the README's ASCII model as a real, motion-driven graphic. This is the moment the idea "clicks."
4. **The data path.** `mmap (NVMe) → CPU-RAM cache → pinned staging → streaming-zone buffer → compute`, shown as a horizontal pipeline where DMA visibly "hides under" compute.
5. **Features grid.** 6 cards drawn from the product PRD §3: Zero-dependency local inference · OpenAI-compatible API · Dynamic VRAM profiling · Double-buffered async streaming · Speculative decoding · Multi-GPU / multi-node scaling.
6. **Proof / numbers.** 5–12 tok/s on 70B @ 16 GB, < 50 MB orchestration overhead, zero-OOM to 8,192 tokens context. Presented as hard figures with the caveat conditions visible (honesty > spin).
7. **Show the CLI.** A real terminal block with the `flip profile` output (from README) — this is the single most persuasive asset for this audience.
8. **Roadmap teaser.** Phase 1 → 2 → 3, with what's shipped vs. planned marked honestly (GPU kernel = "in progress", per README).
9. **Final CTA.** Repeat `Get started` + repo, with license (Apache-2.0) and "runs on any machine — no GPU required to try the profiler."

### 5.2 How it works
Long-form technical page. Sections mirror `specs.md` / README: VRAM partitioning, the three zones, double-buffered A/B schedule, tiered CPU-RAM cache, PagedAttention KV cache, the LayersToLoad formula rendered cleanly (KaTeX or pre-rendered SVG), and the CpuKernel/StubKernel/GPU-kernel trait story. Include the full VRAM-budget equation and a worked example matching the README's 70B numbers.

### 5.3 Benchmarks
Performance targets vs. measured, a hardware compatibility matrix (VRAM size × model size → layers resident % → est. tok/s), and methodology notes. Every number must state its conditions (PCIe gen, NVMe, GPU). Include a "profile your own setup" callout linking to the CLI.

### 5.4 Get started
Prerequisites (Rust 1.75+, C toolchain, optional CUDA/ROCm), copy-paste install, `cargo run -- profile`, then `serve`. Tabbed OS instructions (Linux / macOS / Windows) and GPU-backend tabs (host fallback / CUDA / ROCm). Every command has a copy button.

### 5.5 About
The naming story ("flip" = flipping layers at the microsecond level), the phase roadmap, license, and links to `PRD.md`, `specs.md`, and the repo.

---

## 6. Design Direction

> The user has fixed two constraints: **dark theme** and **Inter font**. The direction below spends its creativity on the axes left free — the signature, the accent system, and motion — rather than on defaults.

### 6.1 Concept
**"The instrument panel of a streaming engine."** flip is a systems tool that makes an invisible, high-frequency process (layers flipping through VRAM) legible. The site should feel like a precise, live technical instrument — dark, calm, data-dense where it counts — not a generic dark SaaS landing page. The atmosphere is *quiet machinery under load*: mostly still, with deliberate motion exactly where a layer "flips."

We deliberately avoid the default near-black + single acid-green look. Instead we use a **dual-accent system that encodes the product's own duality** (streaming vs. compute, buffer A vs. buffer B), which is meaningful rather than decorative.

### 6.2 Color tokens (dark theme)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0A0C10` | Page background — deep blue-black, not pure black |
| `--surface` | `#12151C` | Cards, panels |
| `--surface-2` | `#1A1F29` | Raised / hover surfaces, code blocks |
| `--border` | `#232A36` | Hairline dividers, card borders |
| `--text` | `#E6EAF2` | Primary text |
| `--text-muted` | `#8B94A7` | Secondary text, captions, labels |
| `--accent-stream` | `#3DD8C4` | **Streaming/flow** accent (teal-cyan) — primary CTAs, active flow |
| `--accent-compute` | `#F5A742` | **Compute** accent (warm amber) — the "current block executing", buffer B |
| `--accent-pinned` | `#6E8BFF` | **Pinned zone** accent (indigo) — permanent-resident elements |
| `--danger` | `#FF5C6C` | Errors, OOM warnings in illustrations |

Usage rule: **teal is the everyday accent** (buttons, links, focus). Amber and indigo appear almost only inside the zone/flow visualizations to carry real meaning — restraint keeps the signature legible.

### 6.3 Typography
- **Primary (mandated):** **Inter** — UI, headings, and body. Use the full weight range intentionally: display headings at 600–700 with tightened tracking (`-0.02em`) and large sizes; body at 400/450; labels/eyebrows at 500 uppercase with `+0.08em` tracking.
- **Utility / data face:** **JetBrains Mono** (or system `ui-monospace` fallback) for CLI blocks, VRAM numbers, formulas, and technical labels. This pairing is justified: an inference *engine* lives in the terminal, so monospace numerals are content, not decoration, and they make the metrics feel measured rather than marketed.
- **Type scale (rem):** 0.75 · 0.875 · 1 · 1.25 · 1.5 · 2 · 3 · 4.5 (clamp for fluid hero).

### 6.4 Layout & structure
- 12-column grid, generous vertical rhythm, hairline `--border` dividers between sections (no heavy boxes).
- Structural labels that **encode real information**: section eyebrows show the zone/stage they describe (e.g. `STREAMING ZONE`, `STAGE 03 · DMA`), and numbering appears **only** on genuinely sequential content (the data-path pipeline and the phase roadmap) — never as decorative `01/02/03` on the features grid.
- Radius: small and consistent (`8px` cards, `6px` buttons) — precise, not pill-soft.

### 6.5 Signature element
**The live "flip" visualizer** (see §7): a compact animation of the three VRAM zones with two streaming buffers swapping — A executes (amber) while B loads (teal fills), then they flip. It is the one memorable, bold element; everything else stays disciplined and quiet around it.

### 6.6 Motion
- Reduced by default; **one orchestrated hero moment** (buffers flipping) that loops slowly and pauses off-screen.
- Scroll-reveal for the data-path pipeline (stages light up left→right to show DMA hiding under compute).
- Hover micro-interactions on feature cards and CLI copy buttons only.
- **`prefers-reduced-motion` fully respected:** the visualizer falls back to a static, labeled diagram.

---

## 7. Key Interactive Component — VRAM-Budget Visualizer

The hero's proof-in-motion. Behavior:

- Sliders / presets for **GPU VRAM** (8 / 12 / 16 / 24 GB) and **model size** (7B / 70B / 405B).
- Computes **layers resident** and **% resident** live using the product's real formula:
  `LayersToLoad = ⌊(M_free − M_safety − M_kv_total − M_pinned) / M_layer_weight⌋`, clamped to `[1, N_layers]`.
- Renders the three zones filling up and the A/B buffers flipping, with an estimated tok/s band.
- Defaults to the README's headline case (70B @ 16 GB → ~29/80 layers, ~36% resident) so the marketing claim is self-demonstrating.
- Must be accurate: the numbers shown are the same math the engine uses. No invented figures.

Fallback: on reduced-motion or no-JS, render a static SVG of the 70B @ 16 GB case with the same numbers.

---

## 8. Content Requirements

- All technical copy sourced from `README.md`, `PRD.md`, and `specs.md` — do not invent capabilities. GPU kernel is **"in progress"**, the OpenAI-compatible server loop is a **later milestone**; the site must reflect this honestly (roadmap markers, not present-tense claims).
- Voice: active, plain, specific. "Run a 70B model," not "Unlock unprecedented AI capabilities."
- Every performance number carries its conditions inline.
- Error/empty states in the visualizer speak plainly (e.g. an over-budget config shows *"Won't fit — even 1 layer exceeds the budget. Try a smaller model or more VRAM."*).
- CTAs are consistent everywhere: primary `Get started`, secondary `View on GitHub`.

---

## 9. Technical Requirements

### 9.1 Stack
- **Next.js (App Router)** + **TypeScript** + **Tailwind CSS**.
- Static-first: all marketing pages statically generated (SSG). No server runtime required for launch.
- **Fonts:** Inter + JetBrains Mono via `next/font` (self-hosted, no external font-CDN request; avoids CLS).
- Content in MDX where long-form (How it works, About) to keep copy editable without touching layout.
- Design tokens as CSS custom properties consumed by a Tailwind theme extension (single source of truth for §6.2 colors).

### 9.2 Component inventory
Nav, Hero, VRAMVisualizer, ZoneDiagram, DataPathPipeline, FeatureCard/Grid, StatBlock, TerminalBlock (with copy), Tabs (OS/GPU backend), RoadmapTimeline, Footer, CTASection.

### 9.3 Quality floor (non-negotiable)
- Responsive from 360px → wide desktop; the visualizer degrades gracefully on mobile.
- WCAG 2.1 AA: contrast ≥ 4.5:1 for text (verify accent-on-dark), visible keyboard focus rings (teal), semantic landmarks, alt text, `prefers-reduced-motion`.
- Performance budget: hero JS < 60 KB gzipped; no layout shift from fonts/images; images as AVIF/WebP with dimensions set. `logo.png` (currently ~1.1 MB) must be optimized/converted before use.
- SEO: per-page `<title>`/meta, Open Graph + Twitter cards, `sitemap.xml`, `robots.txt`, JSON-LD `SoftwareApplication`.
- Analytics: privacy-friendly (Plausible/Umami or self-hosted), tracking the §2.2 CTA events. No third-party trackers that require a cookie banner if avoidable.

### 9.4 Hosting / delivery
Static export deployable to Vercel / Netlify / GitHub Pages / Cloudflare Pages (any static host). No database. CI: build + Lighthouse CI gate on the §2.2 thresholds.

---

## 10. Milestones

| Phase | Deliverable | Exit criteria |
|---|---|---|
| **M0 — Design** | Tokens, type scale, hero + one section in high fidelity | Signed off against §6; passes AA contrast |
| **M1 — Core** | Home page end-to-end incl. static ZoneDiagram + TerminalBlock | Lighthouse ≥ 95 across the board on Home |
| **M2 — Interactive** | Live VRAMVisualizer with real formula + reduced-motion fallback | Numbers match engine math for 3 preset cases |
| **M3 — Full site** | How-it-works, Benchmarks, Get-started, About | All nav routes complete, content sourced & reviewed |
| **M4 — Launch** | SEO, analytics, OG images, CI gate, hosting | CI green; metrics instrumentation verified |

---

## 11. Open Questions / Assumptions

Assumptions made (flag if wrong):
1. **English-only, single-language** at launch.
2. **No blog/CMS** in v1 — long-form docs stay in the repo (`README`, `specs.md`); site links out.
3. **Product is open-source (Apache-2.0)** — no pricing/paid tiers, so no billing or auth.
4. **Live GitHub star count** is nice-to-have; static fallback is acceptable if the API/rate-limit is a hassle.
5. **Domain & brand lock-up** (final logo/wordmark for `flip`) will be provided; current `logo.png` is a placeholder to be optimized.
6. Benchmark numbers beyond the README's simulated profile are **targets**, labeled as such until measured on real hardware.

Please confirm or correct these before M0 sign-off.

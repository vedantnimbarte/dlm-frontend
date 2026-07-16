import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

const REPO = "https://github.com/vedantnimbarte/dlm";

// The build arc, as it actually stands in the repo — all three phases are
// written, merged, tested, and shipped.
const PHASES = [
  {
    phase: "Phase 1",
    title: "The streaming core",
    items: [
      "VRAM profiler & layer-budget math",
      "Double-buffered A/B streaming schedule",
      "CPU host-fallback kernel — the correctness oracle",
    ],
  },
  {
    phase: "Phase 2",
    title: "On the GPU",
    items: [
      "CUDA compute kernels — AMD/ROCm compute planned (memory management only today)",
      "PagedAttention KV cache",
      "Speculative decoding — provably identical output",
    ],
  },
  {
    phase: "Phase 3",
    title: "Serve & scale",
    items: [
      "OpenAI-compatible server with continuous batching",
      "Multi-GPU pipeline parallelism",
      "Distributed master-worker over Protobuf/TCP",
    ],
  },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "The naming story — Dynamic LLM — the Phase 1 → 2 → 3 roadmap, the Apache-2.0 license, and where the code lives.",
};

export default function About() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* Header */}
        <section className="shell pb-4 pt-20 sm:pt-28">
          <Reveal>
            <span className="eyebrow">Story &amp; roadmap</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              Why it&rsquo;s called dlm.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-muted">
              dlm is short for <span className="text-text">Dynamic LLM</span>: the
              model loads dynamically, streaming layers through VRAM as it runs
              instead of resident-loading the whole thing. The name is the thesis.
            </p>
          </Reveal>
        </section>

        {/* Naming story */}
        <Section
          eyebrow="The name"
          title="Dynamic, not resident."
          intro="Every other engine assumes the model must live in VRAM in full. dlm assumes the opposite — that a layer only needs to be present the instant it computes — and builds the whole engine around keeping the model in motion."
        >
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Reveal>
              <div className="glass glass-interactive flex h-full flex-col rounded-card p-6">
                <span className="font-display text-[2.4rem] font-semibold leading-none text-accent-stream">
                  d
                </span>
                <h3 className="mt-4 font-display text-[1.05rem] font-medium text-text">
                  Dynamic
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-text-muted">
                  The resident window changes every step. Layers stream in and out
                  on demand rather than sitting in VRAM for the whole run.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="glass glass-interactive flex h-full flex-col rounded-card p-6">
                <span className="font-display text-[2.4rem] font-semibold leading-none text-accent-compute">
                  L
                </span>
                <h3 className="mt-4 font-display text-[1.05rem] font-medium text-text">
                  Large
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-text-muted">
                  The point is the models you couldn&rsquo;t fit — 70B, 405B — on
                  the consumer card you already own, not the ones that fit anyway.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="glass glass-interactive flex h-full flex-col rounded-card p-6">
                <span className="font-display text-[2.4rem] font-semibold leading-none text-accent-pinned">
                  M
                </span>
                <h3 className="mt-4 font-display text-[1.05rem] font-medium text-text">
                  Model
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-text-muted">
                  One Rust binary, no Python runtime, no cloud call. The whole
                  model runs on the machine in front of you.
                </p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Roadmap */}
        <Section
          eyebrow="The roadmap"
          title="Every phase, written and shipped."
          intro="Built in the open, all three phases are merged, tested, and shipped in the repo — from the streaming core to the GPU kernels to the full serving stack."
        >
          <PhaseTimeline />
        </Section>

        {/* Open source */}
        <Section
          eyebrow="License"
          title="Apache-2.0, and the code is the spec."
          intro="dlm is open source under Apache-2.0 — use it, fork it, ship it. The engine, the profiler, and the tests all live in the repo; the code is the source of truth for every claim on this site."
        >
          <Reveal delay={80} className="mt-10 flex flex-wrap gap-3">
            <a
              href={REPO}
              className="btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub ★
            </a>
            <a
              href={`${REPO}/blob/main/LICENSE`}
              className="btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Read the license
            </a>
          </Reveal>
        </Section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}

// A connected vertical timeline — the phases are genuinely sequential, so the
// rail carries real information. Every node is complete (teal), no status
// pills: the story is "shipped," not "in flight."
function PhaseTimeline() {
  return (
    <div className="relative mt-12">
      {/* the rail */}
      <span
        aria-hidden
        className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-stream/70 via-accent-stream/40 to-accent-stream/10 sm:left-[15px]"
      />
      <ol className="flex flex-col gap-5">
        {PHASES.map((p, i) => (
          <Reveal key={p.phase} delay={i * 90} as="li">
            <div className="relative flex gap-5 sm:gap-6">
              {/* node */}
              <span
                className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-stream/50 bg-accent-stream/15 sm:h-8 sm:w-8"
                aria-hidden
              >
                <CheckGlyph />
              </span>
              {/* card */}
              <div className="glass glass-interactive flex-1 rounded-card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[0.72rem] uppercase tracking-eyebrow text-text-muted">
                      {p.phase}
                    </span>
                    <h3 className="font-display text-[1.1rem] font-medium text-text">
                      {p.title}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-accent-stream/40 bg-accent-stream/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-eyebrow text-accent-stream">
                    <CheckGlyph small />
                    shipped
                  </span>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {p.items.map((it) => (
                    <li
                      key={it}
                      className="flex gap-2 text-[0.85rem] leading-snug text-text-muted"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-stream"
                        aria-hidden
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

function CheckGlyph({ small = false }: { small?: boolean }) {
  const s = small ? 9 : 13;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--accent-stream)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8.5l3.5 3.5L13 4.5" />
    </svg>
  );
}

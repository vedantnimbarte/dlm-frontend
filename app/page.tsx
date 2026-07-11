import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ZoneDiagram } from "@/components/ZoneDiagram";
import { DataPathPipeline } from "@/components/DataPathPipeline";
import { FeatureGrid } from "@/components/FeatureGrid";
import { ProofStats } from "@/components/ProofStats";
import { TerminalBlock } from "@/components/TerminalBlock";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { Comparison } from "@/components/Comparison";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "dlm",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, macOS, Windows",
  description:
    "Open-source Rust inference engine that streams transformer layers through VRAM to run 70B+ models on consumer GPUs.",
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Nav />
      <main id="main">
        <Hero />

        {/* 2 · The problem */}
        <Section
          eyebrow="The hardware wall"
          title="A 70B model wants ~40 GB. Your card has 16."
          intro="Resident loading means the whole model sits in VRAM at once. That math has kept the best open models off consumer hardware — until you stop assuming every layer must be present at the same time."
        >
          <Reveal delay={80}>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ContrastCell
                k="Resident load, 70B"
                v="~40 GB"
                note="won't fit"
                danger
              />
              <ContrastCell k="A consumer card" v="16 GB" note="what you own" />
              <ContrastCell
                k="With dlm"
                v="29 layers"
                note="resident, rest streamed"
                stream
              />
            </div>
          </Reveal>
        </Section>

        {/* 3 · The mechanic */}
        <Section
          eyebrow="How dlm works"
          title="Three zones, two buffers, one continuous stream."
          intro="VRAM is partitioned into a pinned zone that never moves, a streaming zone that holds a working window of layers, and a cache that spills to CPU RAM and NVMe. The window streams forward faster than the GPU can drain it."
        >
          <ZoneDiagram />
        </Section>

        {/* 4 · The data path */}
        <Section
          eyebrow="The data path"
          title="Each layer travels from disk to compute — just in time."
          intro="A layer is memory-mapped from NVMe, cached in host RAM, staged in a pinned buffer, and streamed into VRAM before the GPU asks for it. Every stage runs ahead of compute."
        >
          <DataPathPipeline />
        </Section>

        {/* 5 · Features */}
        <Section
          eyebrow="What's in the box"
          title="A complete inference engine."
          intro="The streaming core, the GPU kernels, the server loop, and the scaling stack — all shipped and running today."
        >
          <FeatureGrid />
        </Section>

        {/* 6 · Proof */}
        <Section
          eyebrow="Modeled, with conditions"
          title="The numbers, and exactly when they hold."
          intro="Resident-layer counts come from the engine's own budget math; the tok/s band is a projection from a throughput model, not a measured benchmark. Every figure states its hardware so you can judge it against your own."
        >
          <ProofStats />
        </Section>

        {/* 7 · Show the CLI */}
        <Section
          eyebrow="See it decide"
          title="Point the profiler at your card. Read the plan."
          intro="No weights loaded, no GPU required — dlm profile does the budget math and tells you what will stay resident before you commit."
        >
          <Reveal delay={80} className="mt-10 max-w-3xl">
            <TerminalBlock
              command="dlm profile --model llama-3-70b --vram 16"
              caption="Simulated profile on a 16 GB card, Q4 weights, 8,192-token context."
              lines={[
                { text: "  detecting device ............ GPU 0 · 16.0 GB free", tone: "muted" },
                { text: "  model .......................  llama-3-70b · 80 layers · Q4", tone: "muted" },
                { text: "", tone: "muted" },
                { text: "  budget", tone: "text" },
                { text: "    safety headroom ..........   0.6 GB", tone: "muted" },
                { text: "    pinned  (embed·norm·head) .   0.9 GB", tone: "pinned" },
                { text: "    kv cache (8192 ctx) .......   2.8 GB", tone: "pinned" },
                { text: "    layer weight ..............   0.40 GB / layer", tone: "muted" },
                { text: "", tone: "muted" },
                { text: "  plan", tone: "text" },
                { text: "    resident ..................  29 / 80 layers  (36%)", tone: "stream" },
                { text: "    streamed ..................  51 layers via A/B double buffer", tone: "compute" },
                { text: "    est. throughput ...........  5–12 tok/s", tone: "text" },
                { text: "", tone: "muted" },
                { text: "  ✓ fits — 70B on 16 GB. run `dlm serve` to start.", tone: "stream" },
              ]}
            />
          </Reveal>
        </Section>

        {/* 8 · Roadmap teaser */}
        <Section
          eyebrow="Built in the open"
          title="Every phase, shipped."
          intro="dlm is built in the open, one phase at a time — the streaming core, the GPU kernels, and the full serving stack are all merged and shipped."
        >
          <RoadmapTimeline />
        </Section>

        {/* 9 · Where it fits */}
        <Section
          eyebrow="Where it fits"
          title="A different bet than resident loading."
          intro="Most engines assume the model lives in VRAM in full. dlm streams it, which changes what runs on the hardware you own."
        >
          <Comparison />
        </Section>

        {/* 10 · Final CTA */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function ContrastCell({
  k,
  v,
  note,
  danger = false,
  stream = false,
}: {
  k: string;
  v: string;
  note: string;
  danger?: boolean;
  stream?: boolean;
}) {
  return (
    <div className="glass glass-interactive rounded-card p-6">
      <div className="eyebrow">{k}</div>
      <div
        className={`mt-3 font-mono text-[2.2rem] font-semibold leading-none tnum ${
          danger ? "text-danger" : stream ? "text-accent-stream" : "text-text"
        }`}
      >
        {v}
      </div>
      <div className="mt-2 text-[0.8rem] text-text-muted">{note}</div>
    </div>
  );
}

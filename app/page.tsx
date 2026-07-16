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
    "Open-source Rust inference engine that quantizes transformer weights at load and streams what still doesn't fit, so consumer GPUs run models bigger than their VRAM.",
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
          title="The model doesn't fit. That's the whole problem."
          intro="Resident loading means every weight sits in VRAM at once, so the card's size is a hard yes-or-no on the model. dlm answers that two ways: shrink the weights so they fit, and stream whatever still doesn't. It's not a 16 GB tool — it's for the 4 GB laptop GPU, the 6 GB gaming card, the 8 GB workstation."
        >
          <Reveal delay={80}>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ContrastCell
                k="Llama-3.2-3B, bf16"
                v="5.6 GB"
                note="won't fit a 4 GB card"
                danger
              />
              <ContrastCell
                k="--quant int4"
                v="4.2 tok/s"
                note="all 28 layers resident — no streaming"
                stream
              />
              <ContrastCell
                k="bf16, --stream"
                v="0.024 tok/s"
                note="5 / 28 resident — it runs, slowly"
              />
            </div>
          </Reveal>
        </Section>

        {/* 3 · The mechanic */}
        <Section
          eyebrow="Reach for this first"
          title="Quantize before you stream."
          intro="--quant int4 shrinks each layer 4x at load (int8: 2x), which usually means more of the model stays resident and streaming shrinks or stops entirely — worth far more than any amount of making streaming itself faster. Measured on a 4 GB GTX 1650: a 3B model that doesn't fit in 16-bit goes from 0.024 tok/s streamed to 4.2 tok/s fully resident."
        >
          <ZoneDiagram />
        </Section>

        {/* 4 · The data path */}
        <Section
          eyebrow="The fallback"
          title="What still doesn't fit gets streamed."
          intro="A layer is memory-mapped from NVMe, held in an optional host-RAM cache, staged in a page-locked buffer, and uploaded on a dedicated copy stream so the transfer overlaps compute. Be clear-eyed about the limit: streaming costs bandwidth, and moving most of a model across the bus every token costs far more than the arithmetic does. The window doesn't really cache — its job is to hide the next upload under the current compute."
        >
          <DataPathPipeline />
        </Section>

        {/* 5 · Features */}
        <Section
          eyebrow="What's in the box"
          title="A complete inference engine."
          intro="Load-time quantization, the streaming core, the CUDA kernels, the server loop, and the scaling stack — shipped and running today."
        >
          <FeatureGrid />
        </Section>

        {/* 6 · Proof */}
        <Section
          eyebrow="Measured, with conditions"
          title="The numbers, and exactly when they hold."
          intro="The tok/s figures below were measured on a 4 GB GTX 1650; the resident-layer count comes from the engine's own budget math. Every figure states its hardware and its --quant setting so you can judge it against your own. The projected throughput model lives on the benchmarks page, labelled as a projection."
        >
          <ProofStats />
        </Section>

        {/* 7 · Show the CLI */}
        <Section
          eyebrow="See it decide"
          title="Point the profiler at your card. Read the plan."
          intro="No weights loaded, no GPU required — dlm profile does the budget math and tells you what will stay resident before you commit. Pass --model-path to profile a real checkpoint from its measured layer sizes."
        >
          <Reveal delay={80} className="mt-10 max-w-3xl">
            <TerminalBlock
              command="dlm profile --quant int4"
              caption="Built-in Llama-3-70B-class sample against a simulated 16 GB card, 8,192-token context. Without --quant the same model computes at the checkpoint's own 16-bit dtype — a 1.7 GiB layer, and only 7 of 80 fit."
              lines={[
                { text: "  gpu backend  : none (host fallback)", tone: "muted" },
                { text: "  geometry     : 80 layers, hidden 8192, 64 q-heads / 8 kv-heads", tone: "muted" },
                { text: "  quantization : Int4 (0.5 bytes/param), ~70.6 B params", tone: "muted" },
                { text: "", tone: "muted" },
                { text: "  ── VRAM PLAN ─────────────────────────────────", tone: "text" },
                { text: "    M_free           :    16384.0 MiB", tone: "muted" },
                { text: "    M_safety         :     1536.0 MiB", tone: "pinned" },
                { text: "    M_kv_total       :     2560.0 MiB", tone: "pinned" },
                { text: "    M_layer_weight   :      420.5 MiB", tone: "muted" },
                { text: "    usable           :    12288.0 MiB", tone: "muted" },
                { text: "    ▶ layers_to_load :          29 / 80", tone: "stream" },
                { text: "    ▶ resident       :       36.2%", tone: "stream" },
                { text: "  ──────────────────────────────────────────────", tone: "text" },
                { text: "", tone: "muted" },
                { text: "  swap cycle   : 3 streaming pass(es), window of 29 layer(s)", tone: "compute" },
                { text: "  pipeline     : 4 steps, 2 overlapped (DMA hidden under compute)", tone: "compute" },
              ]}
            />
          </Reveal>
        </Section>

        {/* 8 · Roadmap teaser */}
        <Section
          eyebrow="Built in the open"
          title="What's shipped, and what isn't."
          intro="dlm is built in the open, one phase at a time — the streaming core, the CUDA kernels, and the full serving stack are merged and shipped. AMD GPU compute is not: the ROCm feature manages memory today and runs inference on the CPU."
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

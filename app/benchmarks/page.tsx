import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ProofStats } from "@/components/ProofStats";
import { VramVisualizer } from "@/components/VramVisualizer";
import { CopyCommand } from "@/components/CopyCommand";
import {
  MODELS,
  VRAM_PRESETS,
  computeVram,
  pct,
  SAFETY_GB,
  DEFAULT_CONTEXT,
} from "@/lib/vram";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "A VRAM × model-size matrix of layers resident and tok/s, computed from the engine's own budget formula. Every figure states its conditions.",
};

const METHOD = [
  {
    k: "Source",
    v: "The engine's budget formula",
    d: "Every figure is computed from the same LayersToLoad formula the engine runs — no hand-typed numbers.",
  },
  {
    k: "Weights",
    v: "Int4 (Q4), ~0.5 bytes/param",
    d: "Per-layer and pinned-zone sizes are Q4-class figures. Float or higher-precision checkpoints shift the budget and resident count accordingly.",
  },
  {
    k: "Context",
    v: `${DEFAULT_CONTEXT.toLocaleString()} tokens`,
    d: "KV cache is summed across all layers for the full context — its histories stay resident while weights stream. Longer context spends more of the budget on KV, fewer layers stay resident.",
  },
  {
    k: "Throughput band",
    v: "PCIe 4.0 ×16 · warm NVMe",
    d: "The tok/s band scales a compute-bound ceiling by how much streaming must hide under compute: fully resident approaches the ceiling, heavily streamed drops toward the PCIe floor. A cold cache or slower bus lands lower.",
  },
  {
    k: "Fixed costs",
    v: `${SAFETY_GB} GB safety + pinned zone`,
    d: "A model-independent safety cushion plus the pinned embeddings, final norm, and LM head come off the top before any layer is packed.",
  },
];

export default function Benchmarks() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* Header */}
        <section className="shell pb-4 pt-20 sm:pt-28">
          <Reveal>
            <span className="eyebrow">Performance</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              Numbers you can hold the project to.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-muted">
              Performance figures from the engine's budget math, each stated with
              its conditions — PCIe generation, NVMe, GPU — so you can reproduce
              any of them on your own card with one command.
            </p>
          </Reveal>
        </section>

        {/* Headline stats */}
        <Section
          eyebrow="Headline numbers"
          title="The numbers, and exactly when they hold."
          intro="The 70B-on-16 GB case, stated with its hardware. Each figure carries its conditions inline — spin-free."
        >
          <ProofStats />
        </Section>

        {/* The matrix */}
        <Section
          eyebrow="Compatibility matrix"
          title="VRAM × model → what stays resident."
          intro="Each cell is computed live from the budget formula: the share of layers that stay in VRAM, and the estimated tok/s band. Read down for a card, across for a model."
        >
          <Reveal delay={80} className="mt-10">
            <BenchMatrix />
          </Reveal>
        </Section>

        {/* Interactive */}
        <Section
          eyebrow="Profile your own setup"
          title="Change the card. Watch the plan change."
          intro="Same math, live. Pick a VRAM size and a model to see layers resident, the zone breakdown, and the estimated throughput — the exact figures the engine would compute."
        >
          <Reveal delay={80} className="mt-10">
            <VramVisualizer />
          </Reveal>

          <Reveal delay={140} className="mt-6 max-w-xl">
            <p className="mb-3 text-[0.85rem] text-text-muted">
              Or run it against your real card — no GPU required, no weights
              loaded:
            </p>
            <CopyCommand command="dlm profile --model-path /path/to/model" />
          </Reveal>
        </Section>

        {/* Methodology */}
        <Section
          eyebrow="Methodology"
          title="How each number was produced."
          intro="Every figure on this page comes from the constants below, each carrying its conditions."
        >
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {METHOD.map((m, i) => (
              <Reveal key={m.k} delay={(i % 2) * 80}>
                <div className="glass glass-interactive flex h-full flex-col rounded-card p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="eyebrow">{m.k}</span>
                    <span className="font-mono text-[0.78rem] text-accent-stream">
                      {m.v}
                    </span>
                  </div>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-text-muted">
                    {m.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

// Matrix — rows are models, columns are VRAM presets. Every cell is computed
// from computeVram(), the same formula the engine uses. No invented figures.
function BenchMatrix() {
  return (
    <div className="glass overflow-x-auto rounded-card">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="p-4 font-mono text-[0.7rem] uppercase tracking-eyebrow text-text-muted">
              Model ↓ / VRAM →
            </th>
            {VRAM_PRESETS.map((v) => (
              <th
                key={v}
                className="p-4 font-mono text-[0.8rem] font-semibold text-text tnum"
              >
                {v} GB
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODELS.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-0">
              <th className="p-4 text-left align-middle">
                <div className="font-display text-[0.95rem] font-medium text-text">
                  {m.params}
                </div>
                <div className="mt-0.5 font-mono text-[0.68rem] text-text-muted">
                  {m.nLayers} layers
                </div>
              </th>
              {VRAM_PRESETS.map((v) => {
                const r = computeVram(m, v);
                return (
                  <td key={v} className="p-4 align-middle">
                    {r.fits ? (
                      <div>
                        <div className="font-mono text-[0.95rem] font-semibold text-text tnum">
                          {pct(r.residentFraction)}%
                        </div>
                        <div className="mt-0.5 font-mono text-[0.68rem] text-text-muted tnum">
                          {r.layersResident}/{m.nLayers} · ~{r.tpsLow}–{r.tpsHigh}{" "}
                          tok/s
                        </div>
                        {/* resident-share bar */}
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bg">
                          <div
                            className="h-full rounded-full bg-accent-stream/80"
                            style={{ width: `${pct(r.residentFraction)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-[0.8rem] text-danger">
                        won&rsquo;t fit
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

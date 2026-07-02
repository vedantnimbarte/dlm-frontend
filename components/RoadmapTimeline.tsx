import { Reveal } from "./Reveal";

// Genuinely sequential phases → the timeline is real information, not decoration.
const PHASES = [
  {
    phase: "Phase 1",
    title: "The streaming core",
    status: "shipped",
    items: [
      "VRAM profiler & layer-budget math",
      "Double-buffered A/B streaming schedule",
      "CPU host-fallback kernel",
    ],
  },
  {
    phase: "Phase 2",
    title: "On the GPU",
    status: "in-progress",
    items: [
      "CUDA / ROCm compute kernels",
      "PagedAttention KV cache",
      "Speculative decoding",
    ],
  },
  {
    phase: "Phase 3",
    title: "Serve & scale",
    status: "planned",
    items: [
      "OpenAI-compatible server loop",
      "Multi-GPU / multi-node partitioning",
      "Quantization-aware layer packing",
    ],
  },
];

export function RoadmapTimeline() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {PHASES.map((p, i) => (
        <Reveal key={p.phase} delay={i * 100}>
          <div className="flex h-full flex-col rounded-card border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.72rem] uppercase tracking-eyebrow text-text-muted">
                {p.phase}
              </span>
              <StatusPill status={p.status} />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-text">{p.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {p.items.map((it) => (
                <li key={it} className="flex gap-2.5 text-[0.88rem] text-text-muted">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      p.status === "shipped"
                        ? "bg-accent-stream"
                        : p.status === "in-progress"
                          ? "bg-accent-compute"
                          : "bg-text-muted"
                    }`}
                    aria-hidden
                  />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    shipped: {
      cls: "border-accent-stream/40 bg-accent-stream/10 text-accent-stream",
      label: "shipped",
    },
    "in-progress": {
      cls: "border-accent-compute/40 bg-accent-compute/10 text-accent-compute",
      label: "in progress",
    },
    planned: {
      cls: "border-border bg-surface-2 text-text-muted",
      label: "planned",
    },
  };
  const s = map[status] ?? map.planned;
  return (
    <span
      className={`rounded-[4px] border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-eyebrow ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

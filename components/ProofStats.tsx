import { Reveal } from "./Reveal";

// Every number carries its conditions inline (§8). Honesty > spin.
const STATS = [
  {
    value: "~5–12",
    unit: "tok/s",
    label:
      "70B, Q4 · 16 GB card · PCIe 4.0, warm NVMe — projected from the throughput model, not yet measured on hardware",
  },
  {
    value: "< 50",
    unit: "MB",
    label: "Orchestration overhead beyond model + KV",
  },
  {
    value: "8,192",
    unit: "tokens",
    label: "Context held without OOM on the 16 GB budget",
  },
];

export function ProofStats() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 90}>
          <div className="glass glass-interactive flex h-full flex-col justify-between rounded-card p-6">
            <div className="font-mono text-[2.6rem] font-semibold leading-none tracking-tight text-text tnum">
              {s.value}
              <span className="ml-1.5 text-lg font-normal text-text-muted">
                {s.unit}
              </span>
            </div>
            <p className="mt-6 text-[0.82rem] leading-relaxed text-text-muted">
              {s.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

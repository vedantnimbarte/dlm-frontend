import { Reveal } from "./Reveal";

// Every number carries its conditions inline (§8). Honesty > spin.
// Rows 1–2 are measured on real hardware; row 3 is the profiler's budget math,
// not a throughput claim. No projected tok/s here — the throughput model lives
// on /benchmarks, labelled as a projection.
const STATS = [
  {
    value: "4.2",
    unit: "tok/s",
    label:
      "Llama-3.2-3B at --quant int4 — all 28 layers resident, no streaming · 4 GB GTX 1650 — measured on hardware",
  },
  {
    value: "175×",
    unit: "faster",
    label:
      "than the same model streamed at bf16 (0.024 tok/s, 5/28 resident) on the same 4 GB card — quantizing beats streaming",
  },
  {
    value: "29 / 80",
    unit: "layers",
    label:
      "of a 70B-class model resident on a simulated 16 GB card at --quant int4 — from dlm profile's budget math (7/80 at 16-bit)",
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

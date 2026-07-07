import { Reveal } from "./Reveal";

// Positioning, not a benchmark. Cells describe each project's typical default
// approach — kept factual and neutral (capabilities evolve).
const COLS = ["dlm", "vLLM", "llama.cpp"];

const ROWS: { label: string; cells: string[] }[] = [
  {
    label: "Approach",
    cells: ["Stream layers through VRAM", "Resident in VRAM", "Resident + CPU offload"],
  },
  {
    label: "Model larger than VRAM",
    cells: ["Yes — streamed", "Must fit", "Partial (CPU spillover)"],
  },
  {
    label: "Primary target",
    cells: ["Consumer GPU", "Datacenter GPU", "CPU / consumer"],
  },
  {
    label: "Weights in VRAM at once",
    cells: ["A working window", "All layers", "Offloaded split"],
  },
  {
    label: "API",
    cells: ["OpenAI + Anthropic", "OpenAI", "OpenAI (server)"],
  },
  {
    label: "Runtime",
    cells: ["Single Rust binary", "Python", "C++ binary"],
  },
];

export function Comparison() {
  return (
    <Reveal className="mt-10">
      <div className="glass overflow-x-auto rounded-card">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4" />
              {COLS.map((c) => (
                <th
                  key={c}
                  className={`p-4 font-mono text-[0.85rem] font-semibold ${
                    c === "dlm" ? "text-accent-stream" : "text-text-muted"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-b border-border last:border-0">
                <th className="p-4 text-left align-top font-mono text-[0.72rem] uppercase tracking-eyebrow text-text-muted">
                  {r.label}
                </th>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`p-4 align-top text-[0.85rem] leading-snug ${
                      i === 0
                        ? "font-medium text-text"
                        : "text-text-muted"
                    }`}
                  >
                    {i === 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-accent-stream"
                          aria-hidden
                        />
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[0.75rem] text-text-muted">
        Reflects each project&rsquo;s typical default approach; capabilities
        evolve.
      </p>
    </Reveal>
  );
}

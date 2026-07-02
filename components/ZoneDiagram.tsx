import { Reveal } from "./Reveal";

const ZONES = [
  {
    key: "pinned",
    label: "Pinned zone",
    accent: "var(--accent-pinned)",
    swatch: "bg-accent-pinned",
    span: "always resident",
    body: "Embeddings, final norm, and the LM head never move. They stay put so every token starts and ends without a transfer.",
  },
  {
    key: "streaming",
    label: "Streaming zone",
    accent: "var(--accent-stream)",
    swatch: "bg-accent-stream",
    span: "double-buffered A · B",
    body: "A working window of layers lives here. Buffer A computes the current block while buffer B streams the next one in — then they flip. That flip is the whole trick.",
  },
  {
    key: "cache",
    label: "Cache zone",
    accent: "var(--text-muted)",
    swatch: "bg-text-muted",
    span: "spills to CPU RAM · NVMe",
    body: "Layers not in VRAM wait in a tiered CPU-RAM cache backed by mmap'd weights on NVMe. They flip in on demand, just ahead of when they're needed.",
  },
];

export function ZoneDiagram() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-14">
      {/* The VRAM column — three zones sized by their real footprint */}
      <Reveal className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="eyebrow">VRAM · 16 GB</span>
            <span className="font-mono text-[0.7rem] text-text-muted">70B</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <ZoneBar
              flex="4"
              label="Pinned"
              sub="1.5 GB"
              className="bg-accent-pinned/70"
            />
            <div className="rounded-[5px] border border-accent-stream/40 bg-accent-stream/10 p-1.5">
              <div className="mb-1 px-0.5 font-mono text-[0.62rem] uppercase tracking-eyebrow text-accent-stream">
                Streaming · 29 layers
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <div className="buffer-a h-7 rounded-[3px]" aria-hidden />
                  <div className="mt-1 text-center font-mono text-[0.6rem] text-text-muted">
                    A
                  </div>
                </div>
                <div className="flex-1">
                  <div className="buffer-b h-7 rounded-[3px]" aria-hidden />
                  <div className="mt-1 text-center font-mono text-[0.6rem] text-text-muted">
                    B
                  </div>
                </div>
              </div>
            </div>
            <ZoneBar
              flex="9"
              label="Cache → CPU RAM / NVMe"
              sub="51 layers wait"
              className="bg-[repeating-linear-gradient(90deg,var(--surface-2),var(--surface-2)_6px,var(--bg)_6px,var(--bg)_9px)]"
              muted
            />
          </div>
        </div>
      </Reveal>

      {/* Zone descriptions */}
      <div className="flex flex-col">
        {ZONES.map((z, i) => (
          <Reveal
            key={z.key}
            delay={i * 90}
            className={i > 0 ? "border-t border-border" : ""}
          >
            <div className="flex gap-4 py-5">
              <span
                className={`mt-1.5 h-3 w-3 shrink-0 rounded-[3px] ${z.swatch}`}
                aria-hidden
              />
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="text-lg font-semibold text-text">{z.label}</h3>
                  <span className="font-mono text-[0.72rem] text-text-muted">
                    {z.span}
                  </span>
                </div>
                <p className="mt-1.5 max-w-xl leading-relaxed text-text-muted">
                  {z.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function ZoneBar({
  flex,
  label,
  sub,
  className,
  muted = false,
}: {
  flex: string;
  label: string;
  sub: string;
  className: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-[5px] px-2.5 ${className}`}
      style={{ flexGrow: Number(flex), minHeight: muted ? 56 : 34 }}
    >
      <span
        className={`font-mono text-[0.66rem] ${
          muted ? "text-text-muted" : "text-bg"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-[0.66rem] ${
          muted ? "text-text-muted" : "text-bg/70"
        }`}
      >
        {sub}
      </span>
    </div>
  );
}

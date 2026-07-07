"use client";

import { useMemo, useState } from "react";
import {
  MODELS,
  VRAM_PRESETS,
  computeVram,
  pct,
  DEFAULT_CONTEXT,
} from "@/lib/vram";

export function VramVisualizer() {
  const [vram, setVram] = useState<number>(16);
  const [modelId, setModelId] = useState<string>("70b");

  const model = useMemo(
    () => MODELS.find((m) => m.id === modelId) ?? MODELS[1],
    [modelId]
  );
  const r = useMemo(() => computeVram(model, vram), [model, vram]);

  // Capacity-bar segment widths as % of the VRAM budget.
  const seg = (gb: number) => `${Math.max(0, (gb / vram) * 100)}%`;
  const freeGB = Math.max(0, vram - r.usedGB);

  return (
    <div
      className="glass glass-interactive rounded-card p-4 sm:p-5"
      role="group"
      aria-label="VRAM budget visualizer"
    >
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ControlRow label="GPU VRAM">
          {VRAM_PRESETS.map((v) => (
            <Chip key={v} active={v === vram} onClick={() => setVram(v)}>
              {v}
              <span className="text-[0.6em] font-normal opacity-70"> GB</span>
            </Chip>
          ))}
        </ControlRow>
        <ControlRow label="Model">
          {MODELS.map((m) => (
            <Chip
              key={m.id}
              active={m.id === modelId}
              onClick={() => setModelId(m.id)}
            >
              {m.params}
            </Chip>
          ))}
        </ControlRow>
      </div>

      {/* Readout */}
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
        <div>
          <div className="font-mono text-3xl font-semibold leading-none text-text tnum">
            {r.layersResident}
            <span className="text-text-muted">/{model.nLayers}</span>
          </div>
          <div className="mt-1.5 text-xs text-text-muted">
            layers resident ·{" "}
            <span className="text-accent-stream">{pct(r.residentFraction)}%</span>{" "}
            in VRAM
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl font-semibold leading-none text-text tnum">
            {r.fits ? (
              <>
                ~{r.tpsLow}–{r.tpsHigh}
                <span className="text-sm font-normal text-text-muted"> tok/s</span>
              </>
            ) : (
              <span className="text-danger">—</span>
            )}
          </div>
          <div className="mt-1.5 text-[0.7rem] text-text-muted">
            est. · PCIe&nbsp;4.0 · warm cache
          </div>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="eyebrow">VRAM budget</span>
          <span className="font-mono text-[0.7rem] text-text-muted tnum">
            {vram}.0 GB
          </span>
        </div>
        <div className="flex h-9 w-full overflow-hidden rounded-[5px] border border-border bg-bg">
          <Segment
            w={seg(r.safetyGB)}
            className="bg-[repeating-linear-gradient(45deg,var(--border),var(--border)_3px,transparent_3px,transparent_6px)]"
            title={`Safety headroom · ${r.safetyGB.toFixed(1)} GB`}
          />
          <Segment
            w={seg(r.pinnedGB)}
            className="bg-accent-pinned/70"
            title={`Pinned zone · ${r.pinnedGB.toFixed(1)} GB`}
          />
          <Segment
            w={seg(r.kvGB)}
            className="bg-accent-pinned/30"
            title={`KV cache (${DEFAULT_CONTEXT.toLocaleString()} ctx) · ${r.kvGB.toFixed(1)} GB`}
          />
          <Segment
            w={seg(r.residentWeightGB)}
            className="bg-accent-stream/85"
            title={`Streaming zone — resident layers · ${r.residentWeightGB.toFixed(1)} GB`}
          />
          <Segment
            w={seg(freeGB)}
            className="bg-surface-2"
            title={`Unused headroom · ${freeGB.toFixed(1)} GB`}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-text-muted">
          <Legend swatch="bg-accent-pinned/70">Pinned {r.pinnedGB.toFixed(1)}</Legend>
          <Legend swatch="bg-accent-pinned/30">KV {r.kvGB.toFixed(1)}</Legend>
          <Legend swatch="bg-accent-stream/85">
            Resident {r.residentWeightGB.toFixed(1)} GB
          </Legend>
          <Legend swatch="bg-surface-2 border border-border">
            Free {freeGB.toFixed(1)}
          </Legend>
        </div>
      </div>

      {/* Streaming zone — A/B double buffer swap */}
      {r.fits ? (
        <div className="mt-4 rounded-[6px] border border-border bg-bg/60 p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="eyebrow">Streaming zone · double buffer</span>
            <span className="font-mono text-[0.7rem] text-text-muted tnum">
              {r.streamedLayers} layers stream through
            </span>
          </div>
          <div className="space-y-2" aria-hidden>
            <BufferRow name="A" variant="a" />
            <BufferRow name="B" variant="b" />
          </div>
          <p className="mt-2.5 text-[0.7rem] leading-relaxed text-text-muted">
            <span className="text-accent-compute">Amber</span> executes on the GPU
            while <span className="text-accent-stream">teal</span> streams the next
            window in over PCIe — then they swap. DMA hides under compute.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2.5 rounded-[6px] border border-danger/40 bg-danger/10 p-3">
          <span className="mt-0.5 text-danger" aria-hidden>
            ▲
          </span>
          <p className="text-xs leading-relaxed text-text">
            <span className="font-medium">Won&rsquo;t fit</span> — even one layer
            exceeds the budget on {vram} GB. Try a smaller model or more VRAM.
          </p>
        </div>
      )}
    </div>
  );
}

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow shrink-0">{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-[5px] border px-2.5 font-mono text-xs font-medium transition-colors tnum ${
        active
          ? "border-accent-stream/60 bg-accent-stream/15 text-accent-stream"
          : "border-border bg-surface-2 text-text-muted hover:border-text-muted/50 hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function Segment({
  w,
  className,
  title,
}: {
  w: string;
  className: string;
  title: string;
}) {
  return (
    <div
      className={`h-full transition-[width] duration-500 ease-out ${className}`}
      style={{ width: w }}
      title={title}
    />
  );
}

function Legend({
  swatch,
  children,
}: {
  swatch: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 tnum">
      <span className={`inline-block h-2.5 w-2.5 rounded-[2px] ${swatch}`} />
      {children}
    </span>
  );
}

function BufferRow({ name, variant }: { name: string; variant: "a" | "b" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-3 font-mono text-[0.7rem] text-text-muted">{name}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-[3px] border border-border bg-bg">
        <div className={`h-full ${variant === "a" ? "buffer-a" : "buffer-b"}`} />
      </div>
    </div>
  );
}

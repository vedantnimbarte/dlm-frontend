"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  VRAM_PRESETS,
  PARAM_PRESETS,
  QUANTS,
  KV_QUANTS,
  PCIE_GENS,
  computeVram,
  resolveModel,
  largestModelThatFits,
  largestModelFullyResident,
  pct,
} from "@/lib/vram";

const CONTEXT_PRESETS = [4096, 8192, 16384, 32768] as const;

const ctxLabel = (c: number) => (c >= 1024 ? `${c / 1024}k` : String(c));

export function VramCalculator() {
  const router = useRouter();
  const params = useSearchParams();
  const num = (key: string, fallback: number) => {
    const v = Number(params.get(key));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };

  const [perGpu, setPerGpu] = useState(() => num("vram", 16));
  const [gpuCount, setGpuCount] = useState(() => num("gpus", 1));
  const [paramsB, setParamsB] = useState(() => num("model", 70));
  const [quantId, setQuantId] = useState(() => params.get("q") ?? "q4");
  const [kvId, setKvId] = useState(() => params.get("kv") ?? "fp16");
  const [context, setContext] = useState(() => num("ctx", 8192));
  const [pcieId, setPcieId] = useState(() => params.get("pcie") ?? "4.0");
  const [dlm, setDlm] = useState(() => params.get("dlm") !== "0");

  const quant = QUANTS.find((q) => q.id === quantId) ?? QUANTS[0];
  const kv = KV_QUANTS.find((k) => k.id === kvId) ?? KV_QUANTS[0];
  const pcie = PCIE_GENS.find((p) => p.id === pcieId) ?? PCIE_GENS[1];
  const totalVram = Math.max(1, perGpu * gpuCount);
  const opts = useMemo(
    () => ({ kvFactor: kv.factor, pcieGbps: pcie.gbps }),
    [kv.factor, pcie.gbps]
  );

  const model = useMemo(
    () => resolveModel(paramsB, quant.bytesPerParam),
    [paramsB, quant.bytesPerParam]
  );
  const r = useMemo(
    () => computeVram(model, totalVram, context, opts),
    [model, totalVram, context, opts]
  );
  const maxStreamed = useMemo(
    () => largestModelThatFits(totalVram, quant.bytesPerParam, context, opts),
    [totalVram, quant.bytesPerParam, context, opts]
  );
  const maxResident = useMemo(
    () => largestModelFullyResident(totalVram, quant.bytesPerParam, context, opts),
    [totalVram, quant.bytesPerParam, context, opts]
  );

  // Keep the URL in sync so a config is linkable/bookmarkable.
  useEffect(() => {
    const q = new URLSearchParams({
      vram: String(perGpu),
      gpus: String(gpuCount),
      model: String(paramsB),
      q: quantId,
      kv: kvId,
      ctx: String(context),
      pcie: pcieId,
      dlm: dlm ? "1" : "0",
    });
    router.replace(`/calculator?${q.toString()}`, { scroll: false });
  }, [perGpu, gpuCount, paramsB, quantId, kvId, context, pcieId, dlm, router]);

  const seg = (gb: number) => `${Math.max(0, (gb / totalVram) * 100)}%`;
  const freeGB = Math.max(0, totalVram - r.usedGB);

  // "Without dlm" = a conventional runtime with no layer streaming: the model
  // must fit entirely in VRAM or it OOMs. dlm mode uses the streamed packing.
  const runsNoDlm = r.fullyResident;
  const runs = dlm ? r.fits : runsNoDlm;
  const oom = !dlm && !runsNoDlm; // too big for a non-streaming runtime
  const shownLayers = dlm ? r.layersResident : runsNoDlm ? model.nLayers : 0;
  const shownFraction = shownLayers / model.nLayers;
  const maxForMode = dlm ? maxStreamed : maxResident;

  return (
    <div className="glass rounded-card p-5 sm:p-6" role="group" aria-label="VRAM calculator">
      {/* Controls */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="GPU VRAM (per GPU)">
          <div className="flex flex-wrap items-center gap-1.5">
            {VRAM_PRESETS.map((v) => (
              <Chip key={v} active={v === perGpu} onClick={() => setPerGpu(v)}>
                {v}
                <span className="text-[0.6em] font-normal opacity-70"> GB</span>
              </Chip>
            ))}
            <NumberInput value={perGpu} onChange={setPerGpu} min={1} max={512} suffix="GB" />
          </div>
        </Field>

        <Field label="GPUs">
          <div className="flex items-center gap-2">
            <Stepper value={gpuCount} onChange={setGpuCount} min={1} max={16} />
            <span className="font-mono text-xs text-text-muted tnum">
              = {totalVram} GB total
            </span>
          </div>
        </Field>

        <Field label="Model size">
          <div className="flex flex-wrap items-center gap-1.5">
            {PARAM_PRESETS.map((p) => (
              <Chip key={p} active={p === paramsB} onClick={() => setParamsB(p)}>
                {p}B
              </Chip>
            ))}
            <NumberInput value={paramsB} onChange={setParamsB} min={1} max={2000} suffix="B" />
          </div>
        </Field>

        <Field label="Weight quantization">
          <div className="flex flex-wrap gap-1.5">
            {QUANTS.map((q) => (
              <Chip key={q.id} active={q.id === quantId} onClick={() => setQuantId(q.id)}>
                {q.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="KV-cache quantization">
          <div className="flex flex-wrap gap-1.5">
            {KV_QUANTS.map((k) => (
              <Chip key={k.id} active={k.id === kvId} onClick={() => setKvId(k.id)}>
                {k.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Context length">
          <div className="flex flex-wrap gap-1.5">
            {CONTEXT_PRESETS.map((c) => (
              <Chip key={c} active={c === context} onClick={() => setContext(c)}>
                {ctxLabel(c)}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="PCIe generation">
          <div className="flex flex-wrap gap-1.5">
            {PCIE_GENS.map((p) => (
              <Chip key={p.id} active={p.id === pcieId} onClick={() => setPcieId(p.id)}>
                {p.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      {/* Engine toggle — the headline comparison */}
      <div className="mt-6 flex flex-col gap-2 rounded-[8px] border border-border bg-bg/50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <DlmSwitch on={dlm} onChange={setDlm} />
          <span className="text-sm text-text">
            {dlm ? (
              <>
                <span className="font-medium text-accent-stream">With dlm</span> — streams layers
                from RAM
              </>
            ) : (
              <>
                <span className="font-medium text-text-muted">Without dlm</span> — must fit entirely
                in VRAM
              </>
            )}
          </span>
        </div>
        <span className="text-[0.72rem] text-text-muted">
          {r.fullyResident
            ? "This model already fits in VRAM — dlm and a conventional runtime run it identically."
            : "Toggle to see what a conventional runtime gives you on the same hardware."}
        </span>
      </div>

      {/* Primary readout */}
      <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
        <Readout
          value={
            !runs ? (
              <span className="text-danger">OOM</span>
            ) : (
              <>
                {shownLayers}
                <span className="text-text-muted">/{model.nLayers}</span>
              </>
            )
          }
          label={
            !runs ? (
              <>can&rsquo;t load — {dlm ? "exceeds VRAM even streamed" : "model exceeds VRAM"}</>
            ) : (
              <>
                layers resident ·{" "}
                <span className="text-accent-stream">{pct(shownFraction)}%</span> in VRAM
              </>
            )
          }
        />
        <Readout
          value={
            runs ? (
              <>
                ~{r.tpsLow}–{r.tpsHigh}
                <span className="text-base font-normal text-text-muted"> tok/s</span>
              </>
            ) : (
              <span className="text-danger">OOM</span>
            )
          }
          label={
            !runs ? (
              <>won&rsquo;t run on this hardware</>
            ) : r.fullyResident ? (
              <>est. throughput · {pcie.label} · same with or without dlm</>
            ) : (
              <>est. throughput · {pcie.label} · warm NVMe cache</>
            )
          }
        />
        <Readout
          value={
            <>
              {r.totalWeightGB.toFixed(1)}
              <span className="text-base font-normal text-text-muted"> GB</span>
            </>
          }
          label={<>on disk / download · {quant.label} weights</>}
        />
      </div>

      {/* Capacity bar */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="eyebrow">VRAM budget</span>
          <span className="font-mono text-[0.7rem] text-text-muted tnum">{totalVram}.0 GB</span>
        </div>
        {oom ? (
          <>
            <div className="relative flex h-9 w-full items-center overflow-hidden rounded-[5px] border border-danger/50 bg-danger/10">
              <div
                className="h-full bg-[repeating-linear-gradient(45deg,var(--danger),var(--danger)_4px,transparent_4px,transparent_8px)] opacity-60"
                style={{ width: "100%" }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] text-text">
                needs {r.totalWeightGB.toFixed(1)} GB — overflows by{" "}
                {(r.totalWeightGB + r.kvGB + r.safetyGB - totalVram).toFixed(1)} GB
              </span>
            </div>
            <p className="mt-2 text-[0.7rem] text-text-muted">
              A non-streaming runtime allocates the whole model up front — it won&rsquo;t fit.
            </p>
          </>
        ) : (
          <>
            <div className="flex h-9 w-full overflow-hidden rounded-[5px] border border-border bg-bg">
              <Segment
                w={seg(r.safetyGB)}
                className="bg-[repeating-linear-gradient(45deg,var(--border),var(--border)_3px,transparent_3px,transparent_6px)]"
                title={`Safety headroom · ${r.safetyGB.toFixed(1)} GB`}
              />
              <Segment w={seg(r.pinnedGB)} className="bg-accent-pinned/70" title={`Pinned · ${r.pinnedGB.toFixed(1)} GB`} />
              <Segment w={seg(r.kvGB)} className="bg-accent-pinned/30" title={`KV cache (${kv.label}) · ${r.kvGB.toFixed(1)} GB`} />
              <Segment
                w={seg(r.residentWeightGB)}
                className="bg-accent-stream/85"
                title={`Resident layers · ${r.residentWeightGB.toFixed(1)} GB`}
              />
              <Segment w={seg(freeGB)} className="bg-surface-2" title={`Unused · ${freeGB.toFixed(1)} GB`} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-text-muted">
              <Legend swatch="bg-accent-pinned/70">Pinned {r.pinnedGB.toFixed(1)}</Legend>
              <Legend swatch="bg-accent-pinned/30">KV {r.kvGB.toFixed(1)}</Legend>
              <Legend swatch="bg-accent-stream/85">Resident {r.residentWeightGB.toFixed(1)} GB</Legend>
              <Legend swatch="bg-surface-2 border border-border">Free {freeGB.toFixed(1)}</Legend>
            </div>
          </>
        )}
      </div>

      {/* Largest model each engine can run on this hardware */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <FitCard
          value={maxResident}
          title="Without dlm"
          note="must fit entirely in VRAM — anything larger runs out of memory"
          tone="resident"
          active={!dlm}
        />
        <FitCard
          value={maxStreamed}
          title="With dlm"
          note="streams layers over PCIe — run models far larger than VRAM"
          tone="stream"
          active={dlm}
        />
      </div>

      {/* Mode-aware summary banner */}
      {!r.fits ? (
        <div className="mt-5 flex items-start gap-2.5 rounded-[6px] border border-danger/40 bg-danger/10 p-3">
          <span className="mt-0.5 text-danger" aria-hidden>
            ▲
          </span>
          <p className="text-xs leading-relaxed text-text">
            <span className="font-medium">Won&rsquo;t run even with dlm</span> — even one layer of{" "}
            {paramsB}B at {quant.label} exceeds {totalVram} GB (pinned weights + KV overflow it).
            Lower the context, quantize the KV cache, use a heavier weight quant, or add VRAM.
          </p>
        </div>
      ) : r.fullyResident ? (
        <p className="mt-5 rounded-[6px] border border-border bg-bg/50 p-3 text-xs leading-relaxed text-text-muted">
          <span className="font-medium text-text">Fits fully in VRAM</span> — this one runs at
          ~{r.tpsLow}–{r.tpsHigh} tok/s with or without dlm. dlm&rsquo;s advantage appears on models
          too large to fit entirely: try a bigger size or longer context.
        </p>
      ) : (
        <div className="mt-5 grid gap-2 rounded-[6px] border border-accent-stream/30 bg-accent-stream/[0.05] p-3 sm:grid-cols-2">
          <p className="text-xs leading-relaxed text-text">
            <span className="font-medium text-text-muted">Without dlm:</span>{" "}
            <span className="text-danger">out of memory</span> — a conventional runtime needs the
            full {r.totalWeightGB.toFixed(1)} GB resident.
          </p>
          <p className="text-xs leading-relaxed text-text">
            <span className="font-medium text-accent-stream">With dlm:</span> runs at ~{r.tpsLow}–
            {r.tpsHigh} tok/s, streaming {r.streamedLayers} of {model.nLayers} layers over{" "}
            {pcie.label}.
          </p>
        </div>
      )}

      {/* Host RAM + models CTA */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.72rem] leading-relaxed text-text-muted">
          {dlm && r.hostStageGB > 0 ? (
            <>
              Streamed layers stage in system RAM:{" "}
              <span className="font-mono text-text">{r.hostStageGB.toFixed(1)} GB</span> host RAM.
            </>
          ) : (
            <>
              Curated 7B/70B/405B use measured specs; other sizes are estimated. tok/s assumes a warm
              NVMe cache.
            </>
          )}
        </p>
        <Link href="/models" className="btn-secondary h-9 shrink-0 px-3.5 text-[0.85rem]">
          Browse models that fit (~{maxForMode}B) →
        </Link>
      </div>
    </div>
  );
}

function DlmSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Toggle dlm layer streaming"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        on ? "border-accent-stream/60 bg-accent-stream/30" : "border-border bg-surface-2"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full transition-transform ${
          on ? "translate-x-6 bg-accent-stream" : "translate-x-1 bg-text-muted"
        }`}
      />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      {children}
    </div>
  );
}

function Readout({ value, label }: { value: React.ReactNode; label: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-3xl font-semibold leading-none text-text tnum">{value}</div>
      <div className="mt-1.5 text-xs text-text-muted">{label}</div>
    </div>
  );
}

function FitCard({
  value,
  title,
  note,
  tone,
  active,
}: {
  value: number;
  title: string;
  note: string;
  tone: "resident" | "stream";
  active: boolean;
}) {
  const accent = tone === "resident" ? "text-text-muted" : "text-accent-stream";
  return (
    <div
      className={`rounded-[6px] border p-3.5 transition-colors ${
        active
          ? tone === "stream"
            ? "border-accent-stream/50 bg-accent-stream/[0.07]"
            : "border-border-strong bg-surface-2"
          : "border-border bg-bg/60 opacity-70"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">
          {title}
          {active ? <span className="ml-1.5 text-accent-stream">●</span> : null}
        </span>
        <span className={`font-mono text-xl font-semibold tnum ${accent}`}>
          {value > 0 ? `~${value}B` : "—"}
        </span>
      </div>
      <p className="mt-1.5 text-[0.7rem] leading-relaxed text-text-muted">{note}</p>
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

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  return (
    <span className="inline-flex h-8 items-center rounded-[5px] border border-border bg-surface-2 focus-within:border-text-muted/50">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="h-full px-2 font-mono text-text-muted hover:text-text"
        aria-label={`Decrease (${suffix})`}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(clamp(n));
        }}
        aria-label={`Custom value (${suffix})`}
        className="h-full w-10 bg-transparent text-center font-mono text-xs text-text tnum focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pr-1 font-mono text-[0.6rem] text-text-muted">{suffix}</span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="h-full px-2 font-mono text-text-muted hover:text-text"
        aria-label={`Increase (${suffix})`}
      >
        +
      </button>
    </span>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <span className="inline-flex h-8 items-center rounded-[5px] border border-border bg-surface-2">
      <button
        type="button"
        onClick={() => set(value - 1)}
        className="h-full px-2.5 font-mono text-text-muted hover:text-text"
        aria-label="Fewer GPUs"
      >
        −
      </button>
      <span className="w-6 text-center font-mono text-xs text-text tnum">{value}</span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        className="h-full px-2.5 font-mono text-text-muted hover:text-text"
        aria-label="More GPUs"
      >
        +
      </button>
    </span>
  );
}

function Segment({ w, className, title }: { w: string; className: string; title: string }) {
  return (
    <div
      className={`h-full transition-[width] duration-500 ease-out ${className}`}
      style={{ width: w }}
      title={title}
    />
  );
}

function Legend({ swatch, children }: { swatch: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 tnum">
      <span className={`inline-block h-2.5 w-2.5 rounded-[2px] ${swatch}`} />
      {children}
    </span>
  );
}

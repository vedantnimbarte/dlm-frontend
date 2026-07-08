// VRAM-budget math — the same shape of formula the engine uses.
//
//   LayersToLoad = floor( (M_free − M_safety − M_kv_total − M_pinned) / M_layer_weight )
//   clamped to [1, N_layers]
//
// Constants below are Q4-weight-class figures chosen so the headline case
// (70B @ 16 GB, 8192 ctx) resolves to ~29/80 layers (~36% resident), matching
// the README. Every number the visualizer shows comes from here — no invented
// figures downstream.

export interface ModelSpec {
  id: string;
  label: string;
  params: string; // human label, e.g. "70B"
  nLayers: number;
  layerWeightGB: number; // per-transformer-layer resident weight
  pinnedGB: number; // embeddings + final norm + lm_head (always resident)
  kvPerTokenMB: number; // PagedAttention KV footprint per token
  computeCeilingTps: number; // compute-bound tok/s if fully resident (est.)
}

export const SAFETY_GB = 0.6; // driver / workspace headroom, model-independent
export const DEFAULT_CONTEXT = 8192;

export const MODELS: ModelSpec[] = [
  {
    id: "7b",
    label: "Llama-3 7B",
    params: "7B",
    nLayers: 32,
    layerWeightGB: 0.11,
    pinnedGB: 0.4,
    kvPerTokenMB: 0.13,
    computeCeilingTps: 46,
  },
  {
    id: "70b",
    label: "Llama-3 70B",
    params: "70B",
    nLayers: 80,
    layerWeightGB: 0.4,
    pinnedGB: 0.9,
    kvPerTokenMB: 0.35,
    computeCeilingTps: 18,
  },
  {
    id: "405b",
    label: "Llama-3 405B",
    params: "405B",
    nLayers: 126,
    layerWeightGB: 1.6,
    pinnedGB: 1.8,
    kvPerTokenMB: 0.6,
    computeCeilingTps: 7,
  },
];

export const VRAM_PRESETS = [4, 8, 12, 16, 24] as const;

// ── KV-cache precision ───────────────────────────────────────────────────────
// dlm can quantize the KV cache independently of the weights, which shrinks the
// per-token footprint. Factor multiplies kvPerTokenMB (which is specced at fp16).
export const KV_QUANTS = [
  { id: "fp16", label: "FP16", factor: 1 },
  { id: "int8", label: "int8", factor: 0.5 },
  { id: "int4", label: "int4", factor: 0.25 },
] as const;

// ── PCIe generation ──────────────────────────────────────────────────────────
// Streamed layers cross the bus every step, so bus bandwidth sets the floor of
// the tok/s band. 4.0 ×16 (~32 GB/s) is the baseline the model was tuned to.
export const PCIE_GENS = [
  { id: "3.0", label: "PCIe 3.0", gbps: 16 },
  { id: "4.0", label: "PCIe 4.0", gbps: 32 },
  { id: "5.0", label: "PCIe 5.0", gbps: 64 },
] as const;

const PCIE_BASE_GBPS = 32;

export interface VramOpts {
  kvFactor?: number; // KV precision multiplier (see KV_QUANTS)
  pcieGbps?: number; // bus bandwidth for the streamed-throughput floor
}

export interface VramResult {
  fits: boolean;
  fullyResident: boolean; // every layer fits in VRAM (fast path, no streaming)
  layersResident: number;
  residentFraction: number; // 0..1
  streamedLayers: number;
  // GB breakdown for the three zones
  pinnedGB: number;
  kvGB: number;
  safetyGB: number;
  residentWeightGB: number; // streaming-zone resident weights
  freeGB: number; // budget after fixed costs, before layer packing
  usedGB: number;
  totalWeightGB: number; // full checkpoint (≈ on-disk / download size)
  hostStageGB: number; // streamed layers staged in system RAM during inference
  // headline estimate
  tpsLow: number;
  tpsHigh: number;
}

export function computeVram(
  model: ModelSpec,
  vramGB: number,
  contextTokens: number = DEFAULT_CONTEXT,
  opts: VramOpts = {}
): VramResult {
  const kvFactor = opts.kvFactor ?? 1;
  const pcieGbps = opts.pcieGbps ?? PCIE_BASE_GBPS;

  const kvGB = (model.kvPerTokenMB * kvFactor * contextTokens) / 1024;
  const fixed = SAFETY_GB + model.pinnedGB + kvGB;
  const budgetForLayers = vramGB - fixed;

  const rawLayers = Math.floor(budgetForLayers / model.layerWeightGB);
  // clamp to [1, N] — but flag when even one layer won't fit
  const fits = rawLayers >= 1;
  const fullyResident = rawLayers >= model.nLayers;
  const layersResident = Math.max(1, Math.min(model.nLayers, rawLayers));
  const residentFraction = layersResident / model.nLayers;
  const streamedLayers = model.nLayers - layersResident;
  const residentWeightGB = layersResident * model.layerWeightGB;
  const totalWeightGB = model.pinnedGB + model.nLayers * model.layerWeightGB;

  // tok/s band: compute-bound ceiling scaled by how much streaming must hide
  // under compute. Fully resident → near ceiling; heavily streamed → PCIe-bound
  // floor, and the floor scales with bus bandwidth. Clearly an estimate
  // (warm NVMe cache).
  const floor = 0.28 * (pcieGbps / PCIE_BASE_GBPS);
  const center =
    model.computeCeilingTps * (floor + (1 - floor) * residentFraction);
  const tpsLow = Math.max(1, Math.round(center * 0.8));
  const tpsHigh = Math.max(tpsLow + 1, Math.round(center * 1.45));

  return {
    fits,
    fullyResident,
    layersResident,
    residentFraction,
    streamedLayers,
    pinnedGB: model.pinnedGB,
    kvGB,
    safetyGB: SAFETY_GB,
    residentWeightGB,
    freeGB: Math.max(0, budgetForLayers),
    usedGB: fixed + residentWeightGB,
    totalWeightGB,
    hostStageGB: streamedLayers * model.layerWeightGB,
    tpsLow,
    tpsHigh,
  };
}

export function pct(fraction: number): number {
  return Math.round(fraction * 100);
}

// ── Quantization ────────────────────────────────────────────────────────────
// Weight precision scales the resident weight footprint. KV cache is left at
// fp16 (the common runtime default), so quant does NOT change kvPerTokenMB.

export interface Quant {
  id: string;
  label: string;
  bytesPerParam: number;
}

export const QUANTS: Quant[] = [
  { id: "q4", label: "Q4", bytesPerParam: 0.5 },
  { id: "q8", label: "Q8", bytesPerParam: 1 },
  { id: "fp16", label: "FP16", bytesPerParam: 2 },
];

// The curated MODELS above are specced at Q4. Re-scale weights for other quants.
export const BASE_BYTES_PER_PARAM = 0.5;

export function withQuant(model: ModelSpec, bytesPerParam: number): ModelSpec {
  const s = bytesPerParam / BASE_BYTES_PER_PARAM;
  return {
    ...model,
    layerWeightGB: model.layerWeightGB * s,
    pinnedGB: model.pinnedGB * s,
  };
}

// ── Generic estimator for arbitrary parameter counts ─────────────────────────
// When a model isn't in the curated list, derive a ModelSpec from param count
// alone. Anchors below are real Llama-family shapes; everything in between is
// log-interpolated. Clearly an ESTIMATE — the curated specs are the accurate
// path; this is the "any size" fallback.

const ANCHORS: { p: number; layers: number; hidden: number }[] = [
  { p: 1, layers: 16, hidden: 2048 },
  { p: 3, layers: 26, hidden: 3072 },
  { p: 7, layers: 32, hidden: 4096 },
  { p: 13, layers: 40, hidden: 5120 },
  { p: 34, layers: 48, hidden: 7168 },
  { p: 70, layers: 80, hidden: 8192 },
  { p: 405, layers: 126, hidden: 16384 },
];

function interpShape(paramsB: number): { layers: number; hidden: number } {
  const a = ANCHORS;
  if (paramsB <= a[0].p) return { layers: a[0].layers, hidden: a[0].hidden };
  const last = a[a.length - 1];
  if (paramsB >= last.p) return { layers: last.layers, hidden: last.hidden };
  let lo = a[0];
  let hi = last;
  for (let i = 0; i < a.length - 1; i++) {
    if (paramsB >= a[i].p && paramsB <= a[i + 1].p) {
      lo = a[i];
      hi = a[i + 1];
      break;
    }
  }
  const t =
    (Math.log(paramsB) - Math.log(lo.p)) / (Math.log(hi.p) - Math.log(lo.p));
  return {
    layers: Math.max(1, Math.round(lo.layers + t * (hi.layers - lo.layers))),
    hidden: Math.round(lo.hidden + t * (hi.hidden - lo.hidden)),
  };
}

const VOCAB = 128_000; // modern tokenizer vocab (Llama-3 class)
const GQA = 0.25; // grouped-query attention shrinks KV heads ~4× vs. full MHA

export function modelFromParams(
  paramsB: number,
  bytesPerParam: number
): ModelSpec {
  const { layers, hidden } = interpShape(paramsB);
  const totalWeightGB = paramsB * bytesPerParam; // 1e9 params × bytes = GB
  const pinnedGB = (VOCAB * hidden * bytesPerParam) / 1e9; // embed + lm_head
  const layerWeightGB = Math.max(0.01, (totalWeightGB - pinnedGB) / layers);
  const kvPerTokenMB = (2 * layers * hidden * 2 * GQA) / 1e6; // K+V, fp16, GQA
  const computeCeilingTps = Math.max(2, Math.round(120 / Math.sqrt(paramsB)));
  return {
    id: `gen-${paramsB}`,
    label: `~${paramsB}B (est.)`,
    params: `${paramsB}B`,
    nLayers: layers,
    layerWeightGB,
    pinnedGB,
    kvPerTokenMB,
    computeCeilingTps,
  };
}

// Common sizes shown as chips. 7/70/405 resolve to the curated specs; the rest
// use the generic estimator.
export const PARAM_PRESETS = [3, 7, 13, 34, 70, 405] as const;

// Pick the accurate curated spec when we have one for this size, else estimate.
export function resolveModel(paramsB: number, bytesPerParam: number): ModelSpec {
  const curated = MODELS.find((m) => parseFloat(m.params) === paramsB);
  return curated
    ? withQuant(curated, bytesPerParam)
    : modelFromParams(paramsB, bytesPerParam);
}

// Largest model (billions of params) satisfying `feasible` on this budget.
// Feasibility is monotonic in size (bigger ⇒ more pinned + KV + heavier layers,
// less room), so binary-search it. `pick` selects the criterion: "runs at all"
// (≥1 layer resident, streamed) vs. "fully in VRAM" (every layer resident).
function largestModel(
  vramGB: number,
  bytesPerParam: number,
  contextTokens: number,
  opts: VramOpts,
  pick: (r: VramResult) => boolean
): number {
  const ok = (p: number) =>
    pick(computeVram(modelFromParams(p, bytesPerParam), vramGB, contextTokens, opts));
  if (!ok(1)) return 0;
  let lo = 1;
  let hi = 2000;
  if (ok(hi)) return hi;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo); // floor, not round — the returned size must still qualify
}

// Largest model that runs (streamed) — keeps ≥1 layer resident after fixed costs.
export function largestModelThatFits(
  vramGB: number,
  bytesPerParam: number,
  contextTokens: number = DEFAULT_CONTEXT,
  opts: VramOpts = {}
): number {
  return largestModel(vramGB, bytesPerParam, contextTokens, opts, (r) => r.fits);
}

// Largest model that fits entirely in VRAM — the fast path, no streaming.
export function largestModelFullyResident(
  vramGB: number,
  bytesPerParam: number,
  contextTokens: number = DEFAULT_CONTEXT,
  opts: VramOpts = {}
): number {
  return largestModel(vramGB, bytesPerParam, contextTokens, opts, (r) => r.fullyResident);
}

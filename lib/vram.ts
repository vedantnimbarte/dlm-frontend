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

export const VRAM_PRESETS = [8, 12, 16, 24] as const;

export interface VramResult {
  fits: boolean;
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
  // headline estimate
  tpsLow: number;
  tpsHigh: number;
}

export function computeVram(
  model: ModelSpec,
  vramGB: number,
  contextTokens: number = DEFAULT_CONTEXT
): VramResult {
  const kvGB = (model.kvPerTokenMB * contextTokens) / 1024;
  const fixed = SAFETY_GB + model.pinnedGB + kvGB;
  const budgetForLayers = vramGB - fixed;

  const rawLayers = Math.floor(budgetForLayers / model.layerWeightGB);
  // clamp to [1, N] — but flag when even one layer won't fit
  const fits = rawLayers >= 1;
  const layersResident = Math.max(1, Math.min(model.nLayers, rawLayers));
  const residentFraction = layersResident / model.nLayers;
  const streamedLayers = model.nLayers - layersResident;
  const residentWeightGB = layersResident * model.layerWeightGB;

  // tok/s band: compute-bound ceiling scaled by how much streaming must hide
  // under compute. Fully resident → near ceiling; heavily streamed → PCIe-bound
  // floor. Clearly an estimate (PCIe 4.0 x16, NVMe cache warm).
  const center =
    model.computeCeilingTps * (0.28 + 0.72 * residentFraction);
  const tpsLow = Math.max(1, Math.round(center * 0.8));
  const tpsHigh = Math.max(tpsLow + 1, Math.round(center * 1.45));

  return {
    fits,
    layersResident,
    residentFraction,
    streamedLayers,
    pinnedGB: model.pinnedGB,
    kvGB,
    safetyGB: SAFETY_GB,
    residentWeightGB,
    freeGB: Math.max(0, budgetForLayers),
    usedGB: fixed + residentWeightGB,
    tpsLow,
    tpsHigh,
  };
}

export function pct(fraction: number): number {
  return Math.round(fraction * 100);
}

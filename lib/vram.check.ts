// Sanity check for the VRAM math. Run: npx tsx lib/vram.check.ts
import assert from "node:assert";
import {
  MODELS,
  QUANTS,
  computeVram,
  modelFromParams,
  resolveModel,
  largestModelThatFits,
  largestModelFullyResident,
  withQuant,
} from "./vram";

function approx(a: number, b: number, tol: number, msg: string) {
  assert(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);
}

const q4 = QUANTS[0].bytesPerParam;
const fp16 = QUANTS[2].bytesPerParam;

// Generic estimator lands near the curated 7B spec (its anchor point).
const curated7 = MODELS.find((m) => m.params === "7B")!;
const gen7 = modelFromParams(7, q4);
approx(gen7.kvPerTokenMB, curated7.kvPerTokenMB, 0.05, "7B KV/token");
approx(gen7.computeCeilingTps, curated7.computeCeilingTps, 5, "7B tok/s ceiling");
approx(gen7.nLayers, curated7.nLayers, 1, "7B layers");

// resolveModel uses the curated spec for known sizes, estimator otherwise.
assert(resolveModel(7, q4).nLayers === curated7.nLayers, "resolve 7B → curated");
assert(resolveModel(11, q4).id.startsWith("gen-"), "resolve 11B → generic");

// Higher precision ⇒ heavier weights ⇒ fewer resident layers.
const rLow = computeVram(withQuant(curated7, q4), 8);
const rHigh = computeVram(withQuant(curated7, fp16), 8);
assert(rHigh.residentWeightGB > rLow.residentWeightGB === false || rHigh.layersResident <= rLow.layersResident, "fp16 no more layers than q4");

// largestModelThatFits is monotonic in VRAM and never claims a model that fails.
const big = largestModelThatFits(24, q4, 8192);
const small = largestModelThatFits(8, q4, 8192);
assert(big >= small, "more VRAM fits at least as large a model");
assert(computeVram(modelFromParams(big, q4), 24, 8192).fits, "reported max actually fits");
assert(!computeVram(modelFromParams(big + 50, q4), 24, 8192).fits, "just past max does not fit");

// Fully-resident ceiling is smaller than the streamed ceiling, and actually fits fully.
const fullMax = largestModelFullyResident(24, q4, 8192);
assert(fullMax <= big, "fully-resident max ≤ streamed max");
assert(computeVram(modelFromParams(fullMax, q4), 24, 8192).fullyResident, "reported fully-resident max fits fully");

// KV quant shrinks the KV footprint; PCIe gen raises the streamed tok/s floor.
const kvFp16 = computeVram(modelFromParams(70, q4), 16, 32768, { kvFactor: 1 });
const kvInt4 = computeVram(modelFromParams(70, q4), 16, 32768, { kvFactor: 0.25 });
assert(kvInt4.kvGB < kvFp16.kvGB, "int4 KV smaller than fp16 KV");
assert(kvInt4.layersResident >= kvFp16.layersResident, "smaller KV frees room for layers");
const gen3 = computeVram(modelFromParams(70, q4), 8, 8192, { pcieGbps: 16 });
const gen5 = computeVram(modelFromParams(70, q4), 8, 8192, { pcieGbps: 64 });
assert(gen5.tpsHigh > gen3.tpsHigh, "faster PCIe → higher streamed tok/s");

// Disk/host figures are present and sane.
const spec70 = modelFromParams(70, q4);
const r70 = computeVram(spec70, 16, 8192);
assert(r70.totalWeightGB > r70.residentWeightGB, "total weight exceeds resident weight");
assert(r70.hostStageGB >= 0, "host stage non-negative");

console.log("vram.check: all assertions passed", {
  maxStreamed24gb: big,
  maxFullyResident24gb: fullMax,
  disk70bGB: r70.totalWeightGB.toFixed(1),
});

import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The deep dive: VRAM partitioning, the three zones, the double-buffered A/B schedule, PagedAttention KV cache, and the layer-budget formula.",
};

export default function HowItWorks() {
  return (
    <PagePlaceholder
      eyebrow="Deep dive"
      title="How dlm works, end to end."
      intro="The long-form technical walkthrough of layer streaming — the partition, the schedule, and the math the engine runs."
      outline={[
        "VRAM partitioning: pinned / streaming / cache zones",
        "The double-buffered A/B schedule, step by step",
        "Tiered CPU-RAM cache and mmap'd NVMe weights",
        "PagedAttention KV cache",
        "The LayersToLoad formula with a worked 70B example",
        "CpuKernel / StubKernel / GPU-kernel trait story",
      ]}
    />
  );
}

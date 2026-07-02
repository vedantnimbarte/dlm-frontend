import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "Performance targets vs. measured numbers, a VRAM × model-size hardware matrix, and full methodology — every figure with its conditions.",
};

export default function Benchmarks() {
  return (
    <PagePlaceholder
      eyebrow="Performance"
      title="Targets vs. measured — with the conditions attached."
      intro="A hardware compatibility matrix and throughput numbers you can hold the project to, each stated with its PCIe generation, NVMe, and GPU."
      outline={[
        "VRAM size × model size → layers resident % → est. tok/s matrix",
        "Targets vs. measured, labeled honestly until real-hardware runs",
        "Methodology: how each number was produced",
        "Profile-your-own-setup callout to the CLI",
      ]}
    />
  );
}

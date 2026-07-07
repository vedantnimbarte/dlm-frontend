import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Prerequisites, copy-paste install, and your first dlm profile and serve run — with per-OS and per-GPU-backend instructions.",
};

export default function GetStarted() {
  return (
    <PagePlaceholder
      eyebrow="Install"
      title="From clone to first profile in a few commands."
      intro="Everything you need to run the profiler on your own card — no GPU required to start."
      outline={[
        "Prerequisites: Rust 1.75+, C toolchain, optional CUDA / ROCm",
        "Copy-paste install with per-command copy buttons",
        "First run: cargo run -- profile, then serve",
        "Tabbed OS instructions: Linux / macOS / Windows",
        "GPU-backend tabs: host fallback / CUDA / ROCm",
      ]}
    />
  );
}

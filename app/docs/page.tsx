import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  DocA,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "What dlm is, the three-command quickstart, and a map of the documentation.",
};

const CARDS = [
  {
    href: "/docs/cli",
    title: "CLI reference",
    body: "Every subcommand — search, pull, profile, serve, generate, tokenize, doctor — with flags, examples, and output.",
  },
  {
    href: "/docs/api",
    title: "HTTP API",
    body: "The OpenAI-compatible server: chat/completions with SSE streaming, sampling parameters, auth, and usage fields.",
  },
  {
    href: "/docs/build",
    title: "Build & config",
    body: "Cargo features for CUDA / ROCm / host fallback, environment variables, device selection, and chat templates.",
  },
  {
    href: "/docs/concepts",
    title: "Architecture & math",
    body: "The three VRAM zones, the A/B schedule, the LayersToLoad formula, the compute kernels, and distributed serving.",
  },
];

export default function DocsOverview() {
  const { next } = docPager("/docs");
  return (
    <>
      <DocTitle>Documentation</DocTitle>
      <DocLead>
        dlm (Dynamic LLM) is a Rust inference engine that streams transformer
        layers in and out of VRAM as it computes — so a 70B model runs on 16 GB
        of consumer VRAM. This is the reference: the CLI, the HTTP API, the build
        options, and the architecture underneath.
      </DocLead>

      <DocH2 id="quickstart">Quickstart</DocH2>
      <DocP>
        One line installs a prebuilt binary. Then pull a model from the Hugging
        Face hub and serve it — no Python runtime, no clone, no build.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="curl -fsSL https://raw.githubusercontent.com/vedantnimbarte/dlm/main/install.sh | sh" />
        <CopyCommand command="dlm pull Qwen/Qwen2.5-0.5B-Instruct" />
        <CopyCommand command="dlm serve --model-path ./models/Qwen2.5-0.5B-Instruct --port 8000" />
      </div>
      <DocP>
        The <DocA href="/docs/install">Installation</DocA> page covers per-OS and
        per-GPU-backend details, or follow the guided{" "}
        <DocA href="/get-started">Get started</DocA> walkthrough.
      </DocP>

      <DocH2 id="sections">Explore the docs</DocH2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="glass glass-interactive flex flex-col rounded-card p-5 transition-colors"
          >
            <h3 className="font-display text-[1.05rem] font-medium text-text">
              {c.title}
            </h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-text-muted">
              {c.body}
            </p>
          </a>
        ))}
      </div>

      <DocPager next={next} />
    </>
  );
}

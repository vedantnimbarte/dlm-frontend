import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import { TerminalBlock } from "@/components/TerminalBlock";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  Code,
  DocA,
  DocNote,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

const REPO = "https://github.com/vedantnimbarte/dlm";

export const metadata: Metadata = {
  title: "Rust library",
  description:
    "Use dlm as a Rust crate — the ComputeKernel trait, the forward orchestrator, the profiler, and the distributed coordinator.",
};

export default function Library() {
  const { prev, next } = docPager("/docs/library");
  return (
    <>
      <DocTitle>Rust library</DocTitle>
      <DocLead>
        Beyond the CLI, dlm is a Rust crate. Depend on it to drive the engine
        directly — profile, load, generate, or route a forward pass across nodes.
      </DocLead>

      <DocH2 id="add">Add the dependency</DocH2>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="cargo install --git https://github.com/vedantnimbarte/dlm" />
        <CopyCommand command={`cargo add --git ${REPO} dlm`} />
      </div>
      <DocNote>
        GPU code is behind the <Code>cuda</Code>, <Code>cuda-kernels</Code>, and{" "}
        <Code>rocm</Code> features — enable the one that matches your target. See{" "}
        <DocA href="/docs/build">Build &amp; features</DocA>.
      </DocNote>

      <DocH2 id="modules">Key modules</DocH2>
      <DocTable
        head={["Module", "What's inside"]}
        rows={[
          [
            <Code key="m">forward</Code>,
            <>
              The <Code>ComputeKernel</Code> trait (<Code>run_block</Code>), the{" "}
              <Code>ForwardOrchestrator</Code>, and the CPU / GPU / streaming
              kernels.
            </>,
          ],
          [<Code key="m">profiler</Code>, "The VRAM plan — the LayersToLoad budget math."],
          [
            <Code key="m">loader</Code>,
            "Reads HF-named safetensors (float + GPTQ 4-bit) into the transformer, embedding, and LM head.",
          ],
          [<Code key="m">generate</Code>, "The end-to-end token → logits → sample loop."],
          [
            <Code key="m">distributed</Code>,
            <>
              <Code>partition_layers</Code>, the <Code>Coordinator</Code>, and the
              worker protocol.
            </>,
          ],
          [<Code key="m">server</Code>, "The OpenAI-compatible HTTP engine and batching service."],
        ]}
      />

      <DocH2 id="coordinator">Example: distributed coordinator</DocH2>
      <DocP>
        Split a model across worker nodes and route generation through them — the
        result equals a local greedy run and survives a dead worker.
      </DocP>
      <TerminalBlock
        command="rust"
        lines={[
          { text: "  use dlm::distributed::{partition_layers, Coordinator};", tone: "text" },
          { text: "", tone: "muted" },
          { text: "  let shards = partition_layers(num_layers, 2);", tone: "text" },
          { text: "  let mut coord = Coordinator::new(", tone: "text" },
          { text: "      cfg, layers, embed, norm, head, vocab, routes)?;", tone: "text" },
          { text: "  let tokens = coord.generate(&prompt, 32)?;", tone: "stream" },
        ]}
      />

      <DocH2 id="kernel">The ComputeKernel trait</DocH2>
      <DocP>
        The transformer math sits behind a block-level trait —{" "}
        <Code>run_block</Code> runs one decoder block for one token. Implement it
        to swap in your own compute path; the orchestrator drives it
        autoregressively. See{" "}
        <DocA href="/docs/concepts">Architecture &amp; math</DocA> for the CPU /
        Stub / GPU kernels behind it.
      </DocP>

      <DocH2 id="source">Source</DocH2>
      <DocP>
        The crate is the source of truth for every API — browse it on{" "}
        <DocA href={REPO}>GitHub</DocA>, and read the module docs inline with{" "}
        <Code>cargo doc --open</Code>.
      </DocP>

      <DocPager prev={prev} next={next} />
    </>
  );
}

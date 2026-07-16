import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  DocUl,
  DocLi,
  Code,
  DocA,
  DocNote,
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

const REPO = "https://github.com/vedantnimbarte/dlm";

export const metadata: Metadata = {
  title: "Contributing",
  description:
    "Build dlm from source, run the test suite, understand the feature flags and the GPU parity test, and find your way around the codebase.",
};

export default function Contributing() {
  const { prev, next } = docPager("/docs/contributing");
  return (
    <>
      <DocTitle>Contributing</DocTitle>
      <DocLead>
        dlm is Apache-2.0 and built in the open. It&rsquo;s a single Rust crate
        that builds and tests entirely on CPU — no GPU required to hack on it.
      </DocLead>

      <DocH2 id="build">Build & test</DocH2>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="git clone https://github.com/vedantnimbarte/dlm && cd dlm" />
        <CopyCommand command="cargo build --release" />
        <CopyCommand command="cargo test" />
        <CopyCommand command="cargo test -- --nocapture" />
      </div>
      <DocP>
        The suite covers the safetensors parser and zero-copy reads, the VRAM math
        against hand-computed values, pinned-buffer alignment, tensor
        classification, the layer catalog, and the double-buffer schedule and
        execution correctness.
      </DocP>

      <DocH2 id="features">Feature flags</DocH2>
      <DocP>
        Type-checking works without any GPU toolkit; building the GPU paths needs
        the matching runtime. See <DocA href="/docs/build">Build &amp; features</DocA>{" "}
        for the full matrix.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="cargo check --features cuda   # validates the CUDA FFI" />
        <CopyCommand command="cargo check --features rocm   # validates the ROCm/HIP FFI" />
      </div>

      <DocH2 id="parity">The GPU parity test</DocH2>
      <DocP>
        On a CUDA machine, the parity test decodes the same random model on both
        the CPU and GPU kernels and asserts the hidden states match — the CPU
        kernel is the correctness oracle for the device code.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="cargo test --features cuda-kernels" />
      </div>
      <DocNote>
        <Code>dlm doctor</Code> runs the same CPU-vs-GPU parity probe live on real
        hardware — use it to check the GPU paths on a machine with a card.
      </DocNote>

      <DocH2 id="layout">Codebase map</DocH2>
      <DocTable
        head={["Path", "What lives there"]}
        rows={[
          [<Code key="p">src/forward</Code>, "The kernels (CPU, GPU, streaming), the trait, and the orchestrator."],
          [<Code key="p">src/gpu</Code>, "The CUDA/HIP FFI and kernels.cu."],
          [<Code key="p">src/profiler</Code>, "The VRAM budget math."],
          [<Code key="p">src/server</Code>, "The OpenAI-compatible HTTP server and engine."],
          [<Code key="p">src/distributed</Code>, "Sharding, the coordinator, and the worker protocol."],
          [<Code key="p">src/loader.rs</Code>, "Float safetensors weight loading (F32/F16/BF16) — GPTQ/AWQ qweight checkpoints are refused here."],
        ]}
      />

      <DocH2 id="pr">Opening a pull request</DocH2>
      <DocUl>
        <DocLi>Branch from main and keep changes focused.</DocLi>
        <DocLi>
          Add or update a test — the existing suites (<Code>tests/*.rs</Code>) are
          the pattern to follow.
        </DocLi>
        <DocLi>
          Run <Code>cargo test</Code> and <Code>cargo check</Code> across the
          relevant features before pushing.
        </DocLi>
        <DocLi>
          Open the PR on <DocA href={`${REPO}/pulls`}>GitHub</DocA>.
        </DocLi>
      </DocUl>

      <DocPager prev={prev} next={next} />
    </>
  );
}

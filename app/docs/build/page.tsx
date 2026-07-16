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

export const metadata: Metadata = {
  title: "Build & config",
  description:
    "Cargo features for CUDA / ROCm / host fallback, environment variables, device selection, chat templates, and distributed mode.",
};

export default function Build() {
  const { prev, next } = docPager("/docs/build");
  return (
    <>
      <DocTitle>Build &amp; configuration</DocTitle>
      <DocLead>
        The GPU path is vendor-neutral behind a Cargo feature — everything above
        the backend (storage, profiler, pipeline) is identical across vendors.
        With no feature, the crate builds and runs a page-aligned host fallback,
        so it&rsquo;s fully testable off-GPU on any machine.
      </DocLead>

      <DocH2 id="features">Cargo features</DocH2>
      <DocTable
        head={["Feature", "Vendor", "Runtime", "Env var"]}
        rows={[
          [
            <Code key="f">cuda</Code>,
            "NVIDIA",
            <>
              <Code>cudart</Code> (dynamic)
            </>,
            <Code key="e">CUDA_PATH</Code>,
          ],
          [
            <Code key="f">cuda-kernels</Code>,
            "NVIDIA",
            <>
              dynamic <Code>cudart</Code> + compiled <Code>kernels.cu</Code>{" "}
              (nvcc)
            </>,
            <Code key="e">CUDA_PATH</Code>,
          ],
          [
            <Code key="f">cuda-static</Code>,
            "NVIDIA",
            <>
              <strong className="text-text">static</strong> <Code>cudart</Code>{" "}
              baked in — runs on the driver alone
            </>,
            <Code key="e">CUDA_PATH</Code>,
          ],
          [
            <Code key="f">rocm</Code>,
            "AMD",
            <>
              <Code>amdhip64</Code> — memory only, no compute yet (planned)
            </>,
            <Code key="e">ROCM_PATH</Code>,
          ],
          [<em key="f">(none)</em>, "—", "host fallback", "—"],
        ]}
      />
      <DocNote tone="compute">
        <strong className="text-text">
          NVIDIA (CUDA) is the only backend with working compute kernels
        </strong>{" "}
        — verified on real hardware against the CPU oracle (
        <Code>tests/gpu_parity.rs</Code>). The <Code>rocm</Code> feature provides{" "}
        <strong className="text-text">memory management only</strong> — VRAM
        query and pinned host memory — and has no compute kernels, so on an AMD
        GPU inference <strong className="text-text">falls back to the CPU</strong>
        . AMD GPU compute — a HIP port of <Code>kernels.cu</Code> — is planned,
        not yet available.
      </DocNote>
      <DocUl>
        <DocLi>
          <Code>cuda-kernels</Code> additionally compiles{" "}
          <Code>src/gpu/kernels.cu</Code> with nvcc and enables the device{" "}
          <Code>run_block</Code>. Building a binary that runs the kernels needs
          nvcc + a GPU.
        </DocLi>
        <DocLi>
          <strong className="text-text">
            The prebuilt release ships the <Code>cuda-static</Code> build
          </strong>{" "}
          (Linux and Windows x86-64). A static CUDA runtime means the toolkit is
          needed only at <em>build</em> time — the shipped binary runs on any
          machine with just the NVIDIA driver. <Code>cuda-static</Code> is a
          strict superset of <Code>cuda-kernels</Code>, so there is no separate
          dynamic release asset.
        </DocLi>
        <DocLi>
          The two GPU features are <strong className="text-text">mutually exclusive</strong>.
          With one enabled, buffers are genuine page-locked memory and{" "}
          <Code>mem_get_info</Code> reports the live device&rsquo;s free VRAM.
        </DocLi>
      </DocUl>
      <DocNote>
        <Code>cargo check --features cuda-kernels</Code> type-checks the Rust FFI
        without the toolkit; building a binary that <em>runs</em> the kernels
        needs nvcc + a GPU.
      </DocNote>

      <DocH2 id="build-commands">Build commands</DocH2>
      <DocP>
        Type-checking works without either toolkit installed; building and linking
        require the corresponding runtime on the link path.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="cargo check --features cuda   # validates the CUDA FFI, no linking" />
        <CopyCommand command="cargo check --features rocm   # validates the ROCm/HIP FFI, no linking" />
        <CopyCommand command="CUDA_PATH=/usr/local/cuda cargo build --features cuda-kernels" />
        <CopyCommand command="ROCM_PATH=/opt/rocm cargo build --features rocm" />
      </div>
      <DocNote>
        On a CUDA machine, <Code>cargo test --features cuda-kernels</Code> runs the
        GPU parity test — it decodes the same random model on both the CPU and GPU
        kernels and asserts the hidden states match. The CPU kernel is the
        correctness oracle for the device code.
      </DocNote>

      <DocH2 id="env">Environment variables</DocH2>
      <DocTable
        head={["Variable", "Used by", "Purpose"]}
        rows={[
          [<Code key="v">CUDA_PATH</Code>, "cuda / cuda-kernels", "Locate the CUDA toolkit at build/link time."],
          [<Code key="v">ROCM_PATH</Code>, "rocm", "Locate the ROCm/HIP runtime."],
          [<Code key="v">HF_TOKEN</Code>, "pull", "Auth for gated/private Hugging Face repos."],
          [<Code key="v">DLM_CPU</Code>, "installer", "Set to 1 to force the CPU build."],
          [<Code key="v">DLM_INSTALL_DIR</Code>, "installer", "Change the binary install location."],
        ]}
      />

      <DocH2 id="device">Device selection</DocH2>
      <DocUl>
        <DocLi>
          On a <Code>cuda-kernels</Code> build, generation and serving run on the{" "}
          <strong className="text-text">GPU by default</strong>.
        </DocLi>
        <DocLi>
          <Code>--device cpu</Code> forces the CPU kernel.
        </DocLi>
        <DocLi>
          When the GPU is selected — <Code>--device gpu</Code>, or the default on
          a <Code>cuda-kernels</Code> build — and no GPU is usable, dlm warns and
          falls back to CPU on its own.
        </DocLi>
        <DocLi>
          A CPU-only build defaults to CPU, and an explicit <Code>--device gpu</Code>{" "}
          there errors with a clear message.
        </DocLi>
      </DocUl>

      <DocH2 id="distributed">Distributed mode</DocH2>
      <DocP>
        Scale across GPUs and hosts. See{" "}
        <DocA href="/docs/concepts">Architecture &amp; math</DocA> for how each
        works.
      </DocP>
      <DocTable
        head={["Flag", "Effect"]}
        rows={[
          [<Code key="f">--multi-gpu-ids 0,1,2</Code>, "Pipeline-parallel across local GPUs; only the hidden residual crosses the boundary."],
          [<Code key="f">--distributed-mode worker</Code>, "Serve a layer shard to a master over TCP (Protobuf-framed)."],
          [<Code key="f">--draft-model-path</Code>, "Decode speculatively with a draft model."],
        ]}
      />

      <DocPager prev={prev} next={next} />
    </>
  );
}

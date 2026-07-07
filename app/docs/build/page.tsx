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
          [<Code key="f">cuda</Code>, "NVIDIA", <Code key="r">cudart</Code>, <Code key="e">CUDA_PATH</Code>],
          [
            <Code key="f">cuda-kernels</Code>,
            "NVIDIA",
            <>
              <Code>cudart</Code> + compiled <Code>kernels.cu</Code> (nvcc)
            </>,
            <Code key="e">CUDA_PATH</Code>,
          ],
          [<Code key="f">rocm</Code>, "AMD", <Code key="r">amdhip64</Code>, <Code key="e">ROCM_PATH</Code>],
          [<em key="f">(none)</em>, "—", "host fallback", "—"],
        ]}
      />
      <DocUl>
        <DocLi>
          <Code>cuda-kernels</Code> additionally compiles{" "}
          <Code>src/gpu/kernels.cu</Code> with nvcc and enables the device{" "}
          <Code>run_block</Code>. Building a binary that runs the kernels needs
          nvcc + a GPU.
        </DocLi>
        <DocLi>
          The two GPU features are <strong className="text-text">mutually exclusive</strong>.
          With one enabled, buffers are genuine page-locked memory and{" "}
          <Code>mem_get_info</Code> reports the live device&rsquo;s free VRAM.
        </DocLi>
      </DocUl>

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
          <Code>--device cpu</Code> forces the CPU kernel; if no GPU is usable, dlm
          warns and falls back to CPU on its own.
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

import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocH3,
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
  title: "Installation",
  description:
    "Install the dlm binary with one line, or build from source with per-OS and per-GPU-backend instructions.",
};

export default function Install() {
  const { prev, next } = docPager("/docs/install");
  return (
    <>
      <DocTitle>Installation</DocTitle>
      <DocLead>
        The one-line installer downloads a prebuilt binary — no clone, no Rust
        toolchain, no build. Build from source only if you want to compile it
        yourself or hack on the engine.
      </DocLead>

      <DocH2 id="binary">Prebuilt binary</DocH2>
      <DocP>
        Downloads a binary for your platform (Linux/macOS, x86-64 or arm64) into{" "}
        <Code>~/.local/bin</Code>.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="curl -fsSL https://raw.githubusercontent.com/vedantnimbarte/dlm/main/install.sh | sh" />
      </div>
      <DocUl>
        <DocLi>
          On <strong className="text-text">Linux x86-64 with an NVIDIA GPU</strong>{" "}
          the installer picks the CUDA (GPU) build and runs on the GPU by
          default. Everywhere else it installs the portable CPU build.
        </DocLi>
        <DocLi>
          Force the CPU build with <Code>DLM_CPU=1 curl … | sh</Code>. If the GPU
          build can&rsquo;t load its CUDA runtime, the installer falls back to CPU
          on its own.
        </DocLi>
        <DocLi>
          Set <Code>DLM_INSTALL_DIR</Code> to change the install location.
        </DocLi>
      </DocUl>

      <DocH2 id="from-source">Build from source</DocH2>
      <DocP>
        Rust users can build directly from the repo. Both of these compile the
        host-fallback build, which needs no GPU.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="cargo install --git https://github.com/vedantnimbarte/dlm" />
        <CopyCommand command="git clone https://github.com/vedantnimbarte/dlm && cd dlm && cargo build --release" />
      </div>

      <DocH3 id="prerequisites">Prerequisites</DocH3>
      <DocTable
        head={["Requirement", "Notes"]}
        rows={[
          [
            <Code key="r">Rust 1.75+</Code>,
            <>
              2021 edition, via{" "}
              <DocA key="a" href="https://rustup.rs/">
                rustup
              </DocA>
              . Required to build.
            </>,
          ],
          [
            "C toolchain",
            "build-essential (Linux) / Xcode CLT (macOS) / MSVC Build Tools (Windows) — usually already present.",
          ],
          [
            "GPU runtime (optional)",
            <>
              CUDA Toolkit 12.x or ROCm 6.x — only for the GPU build. The host
              fallback needs neither.
            </>,
          ],
        ]}
      />

      <DocH3 id="rust-per-os">Install Rust, per OS</DocH3>
      <DocP>Linux and macOS use the rustup one-liner:</DocP>
      <div className="mt-4">
        <CopyCommand command="curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" />
      </div>
      <DocUl>
        <DocLi>
          <strong className="text-text">Linux</strong> — then{" "}
          <Code>sudo apt install build-essential</Code>.
        </DocLi>
        <DocLi>
          <strong className="text-text">macOS</strong> — then{" "}
          <Code>xcode-select --install</Code>.
        </DocLi>
        <DocLi>
          <strong className="text-text">Windows</strong> — run{" "}
          <DocA href="https://rustup.rs/">rustup-init.exe</DocA> and install the
          Visual Studio C++ Build Tools (MSVC).
        </DocLi>
      </DocUl>

      <DocH2 id="gpu-builds">GPU builds</DocH2>
      <DocP>
        The GPU path is vendor-neutral behind a Cargo feature — everything above
        the backend is identical across vendors. See{" "}
        <DocA href="/docs/build">Build &amp; config</DocA> for the full feature
        matrix.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="CUDA_PATH=/usr/local/cuda cargo build --features cuda-kernels" />
        <CopyCommand command="ROCM_PATH=/opt/rocm cargo build --features rocm" />
      </div>
      <DocNote>
        <Code>cuda-kernels</Code> compiles the CUDA <Code>run_block</Code> and
        enables the GPU kernel; it needs nvcc + a GPU to build a runnable binary.{" "}
        <Code>cargo check --features cuda-kernels</Code> type-checks the FFI
        without the toolkit.
      </DocNote>

      <DocH2 id="verify">Verify</DocH2>
      <DocP>
        <Code>dlm doctor</Code> reports the GPU backend and free VRAM, then runs a
        CPU inference self-check.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm doctor" />
      </div>

      <DocPager prev={prev} next={next} />
    </>
  );
}

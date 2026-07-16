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
        Prebuilt targets: Linux x86-64/arm64, macOS Apple Silicon, Windows
        x86-64. Every download is checksum-verified against a published{" "}
        <Code>.sha256</Code> before it is unpacked or run. (Intel Macs: build
        from source with <Code>cargo install</Code>.)
      </DocP>
      <DocP>
        <strong className="text-text">Linux / macOS</strong> — installs into{" "}
        <Code>~/.local/bin</Code>:
      </DocP>
      <div className="mt-5">
        <CopyCommand command="curl -fsSL https://raw.githubusercontent.com/vedantnimbarte/dlm/main/install.sh | sh" />
      </div>
      <DocP>
        <strong className="text-text">Windows</strong> — installs into{" "}
        <Code>%LOCALAPPDATA%\Programs\dlm</Code> and adds it to <Code>PATH</Code>:
      </DocP>
      <div className="mt-5">
        <CopyCommand command="irm https://raw.githubusercontent.com/vedantnimbarte/dlm/main/install.ps1 | iex" />
      </div>
      <DocUl>
        <DocLi>
          On{" "}
          <strong className="text-text">
            x86-64 Linux or Windows with an NVIDIA GPU
          </strong>{" "}
          the installer picks the CUDA (GPU) build and runs on the GPU by
          default. Everywhere else — no NVIDIA GPU, arm64, macOS — it installs
          the portable CPU build.
        </DocLi>
        <DocLi>
          An <strong className="text-text">AMD GPU gets the CPU build</strong> —
          dlm has no AMD GPU compute kernels yet, so there is nothing to pick.
          AMD GPU compute is planned; see{" "}
          <DocA href="#gpu-builds">GPU builds</DocA>.
        </DocLi>
        <DocLi>
          Force the CPU build with <Code>DLM_CPU=1</Code> (before the curl, or
          before the Windows one-liner). If the GPU build won&rsquo;t start —
          driver missing or too old — the installer says so and falls back to the
          CPU build on its own.
        </DocLi>
        <DocLi>
          Set <Code>DLM_INSTALL_DIR</Code> to change the install location.
        </DocLi>
      </DocUl>

      <DocH2 id="update">Update &amp; uninstall</DocH2>
      <DocP>
        Updating just reinstalls the latest release (same{" "}
        <Code>DLM_INSTALL_DIR</Code> / <Code>DLM_CPU</Code> env as install);
        uninstalling removes the binary.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="curl -fsSL https://raw.githubusercontent.com/vedantnimbarte/dlm/main/update.sh | sh" />
        <CopyCommand command="curl -fsSL https://raw.githubusercontent.com/vedantnimbarte/dlm/main/uninstall.sh | sh" />
      </div>

      <DocH2 id="completions">Shell completions</DocH2>
      <DocP>
        <Code>dlm completions &lt;shell&gt;</Code> prints a completion script to
        stdout for bash, zsh, fish, elvish, or powershell. Redirect it to your
        shell&rsquo;s completions directory — e.g. for bash:
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm completions bash > ~/.local/share/bash-completion/completions/dlm" />
      </div>

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
              CUDA Toolkit 12.x — only for the CUDA build. The host fallback
              needs nothing, and the <Code key="c">rocm</Code> feature needs no
              toolkit to build (it&rsquo;s memory-only).
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
      <DocNote tone="compute">
        <strong className="text-text">
          The <Code>rocm</Code> build still runs inference on the CPU.
        </strong>{" "}
        It is memory management only — VRAM query and pinned host memory — with{" "}
        <strong className="text-text">no compute kernels</strong>, so it needs no
        ROCm toolkit to build and buys no GPU compute. NVIDIA (CUDA) is the only
        backend with working kernels today, verified on real hardware against the
        CPU oracle. AMD GPU compute — a HIP port of <Code>kernels.cu</Code> — is{" "}
        <strong className="text-text">planned, not yet available</strong>.
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

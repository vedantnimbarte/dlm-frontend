import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CopyCommand } from "@/components/CopyCommand";
import { TerminalBlock } from "@/components/TerminalBlock";
import { TerminalDemo } from "@/components/TerminalDemo";
import { Tabs } from "@/components/Tabs";
import { ReportBug } from "@/components/ReportBug";
import { CTASection } from "@/components/CTASection";

const REPO = "https://github.com/vedantnimbarte/dlm";
const INSTALL = `curl -fsSL https://raw.githubusercontent.com/vedantnimbarte/dlm/main/install.sh | sh`;

export const metadata: Metadata = {
  title: "Get started",
  description:
    "One line installs the dlm binary. Then pull a model from Hugging Face and serve it — with per-OS and per-GPU-backend instructions for building from source.",
};

// Genuinely sequential — install → get a model → serve it. Numbering is real.
const STEPS = [
  {
    n: "01",
    title: "Install the binary",
    body: "One line downloads a prebuilt binary for your platform (Linux/macOS, x86-64 or arm64) into ~/.local/bin. No clone, no Rust toolchain, no build.",
    command: INSTALL,
    note: "On Linux x86-64 with an NVIDIA GPU the installer picks the CUDA build and runs on the GPU by default. Everywhere else it installs the portable CPU build. Set DLM_CPU=1 to force CPU; DLM_INSTALL_DIR to change the location.",
  },
  {
    n: "02",
    title: "Find and pull a model",
    body: "Search the Hugging Face hub and download a checkpoint straight to disk — no hf CLI, no manual file-grabbing. Only safetensors checkpoints load.",
    command: `dlm pull Qwen/Qwen2.5-0.5B-Instruct`,
    note: "dlm search llama-3.2 lists the most-downloaded matches first. pull fetches only the files dlm loads (config.json, *.safetensors, tokenizer) into ./models. Use --token or $HF_TOKEN for gated repos.",
  },
  {
    n: "03",
    title: "Serve it",
    body: "Start the OpenAI-compatible HTTP server. Existing clients — Open WebUI, the OpenAI SDKs — point at dlm with a URL change and talk to it unchanged.",
    command: `dlm serve --model-path ./models/Qwen2.5-0.5B-Instruct --port 8000`,
    note: "Exposes the OpenAI POST /v1/chat/completions and Anthropic POST /v1/messages endpoints, plus GET /v1/models. Add \"stream\": true for token-by-token SSE. Concurrent requests are continuously batched.",
  },
];

// Sourced from the Troubleshooting doc — the failures a new user actually hits
// on their first pull + serve. Keep in sync with /docs/troubleshooting.
const ISSUES: { symptom: React.ReactNode; fix: React.ReactNode }[] = [
  {
    symptom: <>&ldquo;Won&rsquo;t fit&rdquo; — even one layer exceeds the budget</>,
    fix: (
      <>
        Use a smaller model, more VRAM, a shorter{" "}
        <span className="font-mono text-text">--context-length</span>, or fewer{" "}
        <span className="font-mono text-text">--resident-layers</span>. See{" "}
        <a href="/docs/performance" className="text-accent-stream underline-offset-2 hover:underline">
          Performance tuning
        </a>
        .
      </>
    ),
  },
  {
    symptom: <>GGUF / PyTorch-only repo rejected</>,
    fix: (
      <>
        dlm loads <span className="text-text">safetensors only</span>. Pull a
        safetensors variant or convert the checkpoint. See{" "}
        <a href="/docs/models" className="text-accent-stream underline-offset-2 hover:underline">
          Model support
        </a>
        .
      </>
    ),
  },
  {
    symptom: <>401 — gated or private repo on pull</>,
    fix: (
      <>
        Pass <span className="font-mono text-text">--token</span> or set{" "}
        <span className="font-mono text-text">$HF_TOKEN</span> before pulling.
      </>
    ),
  },
  {
    symptom: <>CUDA runtime can&rsquo;t load at startup</>,
    fix: (
      <>
        dlm warns and falls back to CPU on its own. Check{" "}
        <span className="font-mono text-text">cudart</span> is on the library
        path and <span className="font-mono text-text">CUDA_PATH</span> is set.
      </>
    ),
  },
  {
    symptom: (
      <>
        <span className="font-mono text-text">--device gpu</span> errors on a CPU
        build
      </>
    ),
    fix: (
      <>
        A CPU-only build can&rsquo;t use the GPU. Rebuild with{" "}
        <span className="font-mono text-text">--features cuda-kernels</span>. See{" "}
        <a href="/docs/build" className="text-accent-stream underline-offset-2 hover:underline">
          Build &amp; features
        </a>
        .
      </>
    ),
  },
  {
    symptom: <>Model directory not recognized</>,
    fix: (
      <>
        The path needs <span className="font-mono text-text">config.json</span>{" "}
        and one or more <span className="font-mono text-text">*.safetensors</span>{" "}
        shards. <span className="font-mono text-text">dlm pull</span> fetches the
        right files.
      </>
    ),
  },
];

export default function GetStarted() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* Header */}
        <section className="shell pb-4 pt-20 sm:pt-28">
          <Reveal>
            <span className="eyebrow">Install</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              One line to the binary. Three to your first token.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-muted">
              No GPU required to start — the profiler and the CPU path run on any
              machine. Copy, paste, run.
            </p>
          </Reveal>

          <Reveal delay={90} className="mt-8 max-w-2xl">
            <CopyCommand command={INSTALL} />
            <p className="mt-3 font-mono text-[0.72rem] text-text-muted">
              Rust users can also{" "}
              <span className="text-text">cargo install --git {REPO}</span> to
              build from source.
            </p>
          </Reveal>

          <Reveal delay={140} className="mt-6 max-w-2xl">
            <TerminalDemo />
          </Reveal>
        </section>

        {/* Steps */}
        <Section
          eyebrow="Quickstart"
          title="From nothing to a running server."
          intro="Three commands. Each one is copy-paste, and each states what it does under the hood."
        >
          <div className="mt-10 flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="glass glass-interactive rounded-card p-6 sm:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    <div className="lg:w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[0.72rem] text-accent-stream">
                          {s.n}
                        </span>
                        <h2 className="font-display text-[1.2rem] font-medium text-text">
                          {s.title}
                        </h2>
                      </div>
                      <p className="mt-3 text-[0.9rem] leading-relaxed text-text-muted">
                        {s.body}
                      </p>
                    </div>
                    <div className="lg:flex-1">
                      <CopyCommand command={s.command} />
                      <p className="mt-3 text-[0.78rem] leading-relaxed text-text-muted">
                        {s.note}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* First run — profile + serve */}
        <Section
          eyebrow="First run"
          title="See the plan before you commit."
          intro="dlm profile does the VRAM budget math and tells you exactly what will stay resident — no weights loaded, no GPU required."
        >
          <Reveal delay={80} className="mt-10 max-w-3xl">
            <TerminalBlock
              command="dlm profile"
              caption="Built-in Llama-3-70B-class sample against a simulated 16 GB card, Q4 weights, 8,192-token context. Point it at a model directory with --model-path to profile from measured layer sizes."
              lines={[
                { text: "  gpu backend  : none (host fallback)", tone: "muted" },
                { text: "  model source : built-in Llama-3-70B-class sample", tone: "muted" },
                { text: "  geometry     : 80 layers, hidden 8192, 64 q / 8 kv heads", tone: "muted" },
                { text: "  quantization : Int4 (0.5 bytes/param), ~70.6 B params", tone: "muted" },
                { text: "", tone: "muted" },
                { text: "  ── VRAM PLAN ──────────────────────────────", tone: "text" },
                { text: "    M_free           :  16384.0 MiB", tone: "muted" },
                { text: "    M_safety         :   1536.0 MiB", tone: "pinned" },
                { text: "    M_kv_total       :   2560.0 MiB", tone: "pinned" },
                { text: "    M_layer_weight   :    420.5 MiB", tone: "muted" },
                { text: "    ▶ layers_to_load :     29 / 80", tone: "stream" },
                { text: "    ▶ resident       :     36.2%", tone: "stream" },
                { text: "  ────────────────────────────────────────────", tone: "text" },
                { text: "", tone: "muted" },
                { text: "  swap cycle   : 3 streaming pass(es), window of 29 layer(s)", tone: "compute" },
                { text: "  pipeline     : 4 steps, 2 overlapped (DMA hidden under compute)", tone: "compute" },
              ]}
            />
          </Reveal>

          <Reveal delay={140} className="mt-4 max-w-3xl">
            <TerminalBlock
              command={`curl http://127.0.0.1:8000/v1/chat/completions -H 'Content-Type: application/json' -d '{"model":"dlm","messages":[{"role":"user","content":"Hello"}]}'`}
              caption='Once dlm serve is running, any OpenAI-compatible client works. Add "stream": true for Server-Sent Events.'
              lines={[
                { text: '  {"choices":[{"message":{"role":"assistant",', tone: "muted" },
                { text: '     "content":"Hello! How can I help?"}}],', tone: "text" },
                { text: '   "usage":{"completion_tokens":7}}', tone: "muted" },
              ]}
            />
          </Reveal>
        </Section>

        {/* Prerequisites — only for building from source */}
        <Section
          eyebrow="Build from source"
          title="Prerequisites, if you'd rather compile it."
          intro="The installer needs none of this — it ships a prebuilt binary. You only need a toolchain to build dlm yourself or hack on it."
        >
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PrereqCard
              label="Rust"
              value="1.75+"
              note="2021 edition, via rustup. Required to build."
            />
            <PrereqCard
              label="C toolchain"
              value="native"
              note="build-essential / Xcode CLT / MSVC — usually already present."
            />
            <PrereqCard
              label="GPU runtime"
              value="optional"
              note="CUDA 12.x or ROCm 6.x — only for the GPU build. Host fallback needs neither."
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal delay={80}>
              <span className="eyebrow">Install Rust · per OS</span>
              <div className="mt-3">
                <Tabs
                  ariaLabel="Rust install by operating system"
                  tabs={[
                    {
                      key: "linux",
                      label: "Linux",
                      content: (
                        <div className="space-y-3">
                          <CopyCommand command="curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" />
                          <p className="text-[0.78rem] text-text-muted">
                            Then install build tools:{" "}
                            <span className="font-mono text-text">
                              sudo apt install build-essential
                            </span>
                            .
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "macos",
                      label: "macOS",
                      content: (
                        <div className="space-y-3">
                          <CopyCommand command="curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" />
                          <p className="text-[0.78rem] text-text-muted">
                            Then the Xcode command-line tools:{" "}
                            <span className="font-mono text-text">
                              xcode-select --install
                            </span>
                            .
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "windows",
                      label: "Windows",
                      content: (
                        <div className="space-y-3">
                          <p className="text-[0.82rem] text-text">
                            Download and run{" "}
                            <a
                              href="https://rustup.rs/"
                              className="text-accent-stream underline-offset-2 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              rustup-init.exe
                            </a>
                            .
                          </p>
                          <p className="text-[0.78rem] text-text-muted">
                            Install the Visual Studio C++ Build Tools (MSVC) for
                            the native dependencies.
                          </p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Reveal>

            <Reveal delay={140}>
              <span className="eyebrow">Build · per GPU backend</span>
              <div className="mt-3">
                <Tabs
                  ariaLabel="Build by GPU backend"
                  tabs={[
                    {
                      key: "host",
                      label: "Host fallback",
                      content: (
                        <div className="space-y-3">
                          <CopyCommand command="cargo build --release" />
                          <p className="text-[0.78rem] text-text-muted">
                            No GPU, no feature flags. Page-aligned host buffers
                            with the same layout contract — the whole pipeline
                            runs on any machine.
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "cuda",
                      label: "CUDA · NVIDIA",
                      content: (
                        <div className="space-y-3">
                          <CopyCommand command="CUDA_PATH=/usr/local/cuda cargo build --features cuda-kernels" />
                          <p className="text-[0.78rem] text-text-muted">
                            Needs CUDA Toolkit 12.x + nvcc. cuda-kernels compiles
                            the device run_block and enables the GPU kernel; plain{" "}
                            <span className="font-mono text-text">cuda</span> links
                            the runtime only.
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "rocm",
                      label: "ROCm · AMD",
                      content: (
                        <div className="space-y-3">
                          <CopyCommand command="ROCM_PATH=/opt/rocm cargo build --features rocm" />
                          <p className="text-[0.78rem] text-text-muted">
                            Needs ROCm 6.x with amdhip64 on the library path.
                            Everything above the backend is identical across
                            vendors.
                          </p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Verify */}
        <Section
          eyebrow="Verify"
          title="Check your machine, then run a self-test."
          intro="dlm doctor reports the GPU backend and free VRAM, runs a CPU inference self-check, and — on a GPU build — runs a live CPU-vs-GPU parity probe."
        >
          <Reveal delay={80} className="mt-10 max-w-xl">
            <CopyCommand command="dlm doctor" />
            <p className="mt-3 text-[0.78rem] leading-relaxed text-text-muted">
              Pass <span className="font-mono text-text">--model-path</span> to
              check a checkpoint loads and tokenizes.
            </p>
          </Reveal>
        </Section>

        {/* Troubleshooting — the common first-run failures, inline */}
        <Section
          eyebrow="If you hit issues"
          title="First run not working? Start here."
          intro="Almost every first-run problem is one of these: a model that won't fit, an unsupported checkpoint, a gated repo, or a GPU build that can't find its runtime. Run dlm doctor first — it reports your backend and free VRAM, self-checks CPU inference, and with --model-path confirms the checkpoint loads and tokenizes."
        >
          <Reveal delay={80} className="mt-10 max-w-xl">
            <CopyCommand command="dlm doctor --model-path ./models/Qwen2.5-0.5B-Instruct" />
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ISSUES.map((issue, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="glass rounded-card p-6">
                  <h3 className="font-display text-[1rem] font-medium text-text">
                    {issue.symptom}
                  </h3>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-text-muted">
                    {issue.fix}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-8 max-w-2xl">
            <p className="text-[0.9rem] leading-relaxed text-text-muted">
              Still stuck? The full{" "}
              <a
                href="/docs/troubleshooting"
                className="text-accent-stream underline-offset-2 hover:underline"
              >
                Troubleshooting guide
              </a>{" "}
              has the complete error list and an FAQ. If it&rsquo;s a bug, file
              an issue — include your <span className="font-mono text-text">dlm doctor</span> output.
            </p>
            <div className="mt-5">
              <ReportBug className="btn-primary h-10 text-[0.875rem]" />
            </div>
          </Reveal>
        </Section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function PrereqCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="glass glass-interactive rounded-card p-6">
      <div className="eyebrow">{label}</div>
      <div className="mt-3 font-mono text-[1.6rem] font-semibold leading-none text-text">
        {value}
      </div>
      <p className="mt-3 text-[0.82rem] leading-relaxed text-text-muted">
        {note}
      </p>
    </div>
  );
}

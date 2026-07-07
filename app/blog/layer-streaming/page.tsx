import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  DocH2,
  DocP,
  DocUl,
  DocLi,
  Code,
  DocA,
  DocNote,
} from "@/components/DocsContent";
import { postBySlug, formatDate } from "@/components/blogPosts";

const post = postBySlug("layer-streaming")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.excerpt,
};

export default function LayerStreamingPost() {
  return (
    <>
      <Nav />
      <main id="main">
        <article className="shell max-w-2xl py-16 sm:py-20">
          <a
            href="/blog"
            className="font-mono text-[0.75rem] text-text-muted transition-colors hover:text-text"
          >
            ← Blog
          </a>
          <div className="mt-6 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-eyebrow text-text-muted">
            <span>{formatDate(post.date)}</span>
            <span aria-hidden>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-text">
            {post.title}
          </h1>

          <DocP>
            A 70-billion-parameter model in 4-bit weights wants about 40 GB of
            memory. A consumer card has 16. For years that arithmetic kept the
            best open models off the hardware most people own — because everyone
            assumed the same thing: the whole model has to be in VRAM at once.
          </DocP>
          <DocP>
            dlm drops that assumption. A layer only needs to be present the
            instant it computes. So instead of loading the model, dlm{" "}
            <em>streams</em> it — keeping a small window of transformer blocks
            resident and pulling the next window in over PCIe while the GPU works.
            Here&rsquo;s the whole machine.
          </DocP>

          <DocH2 id="wall">The hardware wall</DocH2>
          <DocP>
            Resident loading is simple and fast: every weight sits in VRAM, the
            GPU reads it directly, done. The catch is capacity. Weights scale with
            parameters; VRAM doesn&rsquo;t scale with your budget. A 70B model at
            Q4 needs roughly 40 GB just for weights, before the KV cache and
            activations. On a 16 GB card, it simply won&rsquo;t load.
          </DocP>
          <DocP>
            The usual escapes — smaller models, aggressive quantization, or
            spilling to CPU and eating the latency — all trade away the thing you
            wanted. Streaming is a different bet.
          </DocP>

          <DocH2 id="partition">Three zones</DocH2>
          <DocP>
            dlm carves VRAM into three regions, each with one job:
          </DocP>
          <DocUl>
            <DocLi>
              <strong className="text-text">Pinned zone</strong> — the embedding,
              final norm, and LM head. They&rsquo;re touched every token, so
              moving them would thrash the bus. They stay resident, permanently.
            </DocLi>
            <DocLi>
              <strong className="text-text">Streaming zone</strong> — two buffers,
              A and B, holding the working window of layers. This is where the
              churn happens.
            </DocLi>
            <DocLi>
              <strong className="text-text">Cache zone</strong> — the
              PagedAttention KV cache and residual activations, spilling to a
              tiered CPU-RAM cache backed by memory-mapped NVMe weights.
            </DocLi>
          </DocUl>

          <DocH2 id="schedule">The swap is the trick</DocH2>
          <DocP>
            The streaming zone holds two buffers so it can hide the transfer.
            While buffer A executes the current window on the compute stream,
            buffer B is DMA-ing the next window into VRAM over PCIe. When A
            finishes, they swap — B computes, A loads. Transfer runs under compute,
            so the GPU rarely stalls on the bus.
          </DocP>
          <DocP>
            Each streamed layer travels a tiered path:{" "}
            <Code>mmap (NVMe) → CPU-RAM cache → pinned staging → VRAM → compute</Code>
            . Memory-mapping skips the OS read-buffer copy; the hot-layer cache
            skips the disk read on repeat token steps; and the page-locked host
            buffer lets the PCIe controller DMA straight to VRAM asynchronously.
          </DocP>

          <DocH2 id="math">The budget decides the window</DocH2>
          <DocP>
            How many layers stay resident? One formula, run before any weights
            load:
          </DocP>
          <DocNote>
            <Code>
              LayersToLoad = ⌊(M_free − M_safety − M_kv − M_pinned) /
              M_layer_weight⌋
            </Code>
            , clamped to [1, N]. For a 70B model on 16 GB with an 8k context, that
            lands at 29 of 80 layers resident — the other 51 stream through the
            A/B window.
          </DocNote>
          <DocP>
            Everything after the fixed costs — a safety cushion, the KV cache for
            the whole context, the pinned zone — is spent on as many streamed
            layers as fit. See{" "}
            <DocA href="/docs/concepts">the full breakdown</DocA> for each term.
          </DocP>

          <DocH2 id="cost">What it costs</DocH2>
          <DocP>
            Streaming isn&rsquo;t free. The more a model has to stream, the more
            the token rate leans on how fast the bus and NVMe can feed the window.
            The win isn&rsquo;t peak throughput — it&rsquo;s that the model runs at
            all, on hardware that could never hold it resident. And the levers to
            claw back speed — a wider resident window, a warm cache, speculative
            decoding — are all there. See{" "}
            <DocA href="/docs/performance">Performance tuning</DocA>.
          </DocP>

          <DocH2 id="close">Try it</DocH2>
          <DocP>
            The profiler does this math for your exact card, no GPU required —{" "}
            <Code>dlm profile</Code>. Point it at a model, read the plan, and watch
            a 70B fit where it shouldn&rsquo;t. Start with{" "}
            <DocA href="/get-started">Get started</DocA>.
          </DocP>
        </article>
      </main>
      <Footer />
    </>
  );
}

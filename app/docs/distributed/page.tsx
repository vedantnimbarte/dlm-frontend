import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import { TerminalBlock } from "@/components/TerminalBlock";
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
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Distributed & multi-GPU",
  description:
    "Scale dlm across local GPUs with pipeline parallelism, across nodes with the master-worker protocol, and stream a window of layers through VRAM.",
};

export default function Distributed() {
  const { prev, next } = docPager("/docs/distributed");
  return (
    <>
      <DocTitle>Distributed &amp; multi-GPU</DocTitle>
      <DocLead>
        The same inference engine drives four ways to scale — a wider resident
        window, more throughput, or a model bigger than any single card. Each is a
        flag on <Code>dlm serve</Code>.
      </DocLead>

      <DocH2 id="streaming">Stream a window through VRAM</DocH2>
      <DocP>
        <Code>--stream</Code> holds only a bounded window of layers in memory and
        materializes the rest on demand from the mmap&rsquo;d checkpoint through an
        LRU — so a model can exceed the resident budget. Output is bit-for-bit
        identical to a fully-resident run.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path /path/to/model --stream --resident-layers 29" />
      </div>
      <DocP>
        The window defaults to the VRAM plan&rsquo;s{" "}
        <Code>layers_to_load</Code>; <Code>--resident-layers N</Code> overrides it.
        See <DocA href="/docs/concepts">Architecture &amp; math</DocA> for how the
        plan is computed.
      </DocP>

      <DocH2 id="multi-gpu">Multi-GPU pipeline parallelism</DocH2>
      <DocP>
        Split the model&rsquo;s layers into contiguous per-GPU stages. Each layer
        runs on the GPU that owns it, and only the hidden residual crosses the
        inter-GPU boundary. A split run is bit-for-bit identical to a single
        device.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path /path/to/model --multi-gpu-ids 0,1,2 --device gpu" />
      </div>
      <DocNote>
        It&rsquo;s a <Code>ComputeKernel</Code> wrapper, so the batched and
        speculative server drives a multi-GPU model unchanged. Requires a{" "}
        <Code>cuda-kernels</Code> build.
      </DocNote>

      <DocH2 id="speculative">Speculative decoding</DocH2>
      <DocP>
        A cheap draft model proposes tokens the target verifies in bulk. With
        greedy sampling the output is provably identical to plain decoding, and
        per-request acceptance is reported in the OpenAI <Code>usage</Code> block.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path /path/to/target --draft-model-path /path/to/draft" />
      </div>

      <DocH2 id="master-worker">Distributed master-worker</DocH2>
      <DocP>
        Partition layers into shards across worker nodes. A coordinator streams
        the hidden state through them as length-prefixed Protobuf over plain TCP;
        heartbeats track liveness and an unreachable worker falls back to local
        CPU-RAM execution, so a forward pass still completes.
      </DocP>
      <DocP>Start each worker, then run the coordinator:</DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm serve --model-path /path/to/model --distributed-mode worker --host 0.0.0.0 --port 7001" />
      </div>
      <DocP>
        The coordinator side is driven through the library — partition the layers
        and route the forward pass through the workers:
      </DocP>
      <TerminalBlock
        command="rust"
        lines={[
          { text: "  // Split a model across two worker nodes.", tone: "muted" },
          { text: "  let shards = dlm::distributed::partition_layers(num_layers, 2);", tone: "text" },
          { text: "  let mut coord = dlm::distributed::Coordinator::new(", tone: "text" },
          { text: "      cfg, layers, embed, norm, head, vocab, routes)?;", tone: "text" },
          { text: "  let tokens = coord.generate(&prompt, 32)?;  // == local greedy", tone: "stream" },
        ]}
      />
      <DocP>
        See the <DocA href="/docs/library">Rust library</DocA> reference for the
        coordinator API, and <DocA href="/docs/performance">Performance tuning</DocA>{" "}
        for when each mode pays off.
      </DocP>

      <DocPager prev={prev} next={next} />
    </>
  );
}

import type { Metadata } from "next";
import { CopyCommand } from "@/components/CopyCommand";
import {
  DocTitle,
  DocLead,
  DocH2,
  DocP,
  Code,
  DocA,
  DocNote,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Cookbook",
  description:
    "End-to-end recipes: run a small model, serve a 70B on a 16 GB card with streaming, add speculative decoding, and scale across GPUs.",
};

export default function Tutorials() {
  const { prev, next } = docPager("/docs/tutorials");
  return (
    <>
      <DocTitle>Cookbook</DocTitle>
      <DocLead>
        Concrete, copy-paste recipes that string the commands together for a real
        goal. Each assumes dlm is installed — see{" "}
        <DocA href="/docs/install">Installation</DocA>.
      </DocLead>

      <DocH2 id="first-model">Run your first model</DocH2>
      <DocP>
        Pull a tiny model and generate text on CPU — no GPU, under a minute.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm pull Qwen/Qwen2.5-0.5B-Instruct" />
        <CopyCommand command={`dlm generate --model-path ./models/Qwen2.5-0.5B-Instruct --text "Hello"`} />
      </div>

      <DocH2 id="serve-70b">Serve a 70B on a 16 GB card</DocH2>
      <DocP>
        The headline case. Profile first to see the plan, then serve with layer
        streaming so the model exceeds resident VRAM.
      </DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm profile --model-path ./models/Llama-3.3-70B-Instruct" />
        <CopyCommand command="dlm serve --model-path ./models/Llama-3.3-70B-Instruct --stream --device gpu --port 8000" />
        <CopyCommand command={`curl http://127.0.0.1:8000/v1/chat/completions -H 'Content-Type: application/json' -d '{"model":"dlm","messages":[{"role":"user","content":"Explain layer streaming"}]}'`} />
      </div>
      <DocNote>
        Tune the resident window with <Code>--resident-layers</Code>; see{" "}
        <DocA href="/docs/performance">Performance tuning</DocA>.
      </DocNote>

      <DocH2 id="speculative">Speed it up with speculative decoding</DocH2>
      <DocP>
        Pair the target with a small draft model — accepted tokens advance in
        bulk, with identical greedy output.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path ./models/Llama-3.3-70B-Instruct --draft-model-path ./models/Llama-3.2-1B-Instruct --device gpu" />
      </div>

      <DocH2 id="team">Serve for a small team</DocH2>
      <DocP>
        Bind to the network behind a key, and terminate TLS at a proxy — see{" "}
        <DocA href="/docs/deployment">Deployment &amp; security</DocA>.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path ./models/Llama-3.1-8B-Instruct --host 0.0.0.0 --port 8000 --api-key sk-secret" />
      </div>

      <DocH2 id="multi-gpu">Scale across GPUs</DocH2>
      <DocP>
        Split the layer stack across local cards to widen the resident window —
        details in <DocA href="/docs/distributed">Distributed &amp; multi-GPU</DocA>.
      </DocP>
      <div className="mt-5">
        <CopyCommand command="dlm serve --model-path ./models/Llama-3.3-70B-Instruct --multi-gpu-ids 0,1 --device gpu" />
      </div>

      <DocPager prev={prev} next={next} />
    </>
  );
}

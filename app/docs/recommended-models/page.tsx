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
  DocTable,
  DocPager,
} from "@/components/DocsContent";
import { docPager } from "@/components/docsNav";

export const metadata: Metadata = {
  title: "Recommended models",
  description:
    "A starting point for models that load cleanly in dlm — small models to try first, and the large streaming targets dlm is built for.",
};

export default function RecommendedModels() {
  const { prev, next } = docPager("/docs/recommended-models");
  return (
    <>
      <DocTitle>Recommended models</DocTitle>
      <DocLead>
        dlm loads Llama-style decoders from Hugging Face safetensors checkpoints.
        These are good places to start — pull one and serve it. Exact repo names
        change over time; search the hub for the current ones.
      </DocLead>

      <DocH2 id="small">Small — try these first</DocH2>
      <DocP>
        Fit comfortably on modest VRAM (or CPU), so you can validate your setup
        end to end in a minute.
      </DocP>
      <DocTable
        head={["Model", "Params", "Pull"]}
        rows={[
          [
            "Qwen2.5 0.5B Instruct",
            "0.5B",
            <Code key="p">dlm pull Qwen/Qwen2.5-0.5B-Instruct</Code>,
          ],
          [
            "Llama 3.2 1B Instruct",
            "1B",
            <Code key="p">dlm pull meta-llama/Llama-3.2-1B-Instruct</Code>,
          ],
          [
            "Qwen2.5 3B Instruct",
            "3B",
            <Code key="p">dlm pull Qwen/Qwen2.5-3B-Instruct</Code>,
          ],
        ]}
      />

      <DocH2 id="mid">Mid-size — everyday use</DocH2>
      <DocTable
        head={["Model", "Params", "Pull"]}
        rows={[
          [
            "Llama 3.1 8B Instruct",
            "8B",
            <Code key="p">dlm pull meta-llama/Llama-3.1-8B-Instruct</Code>,
          ],
          [
            "Qwen2.5 7B Instruct",
            "7B",
            <Code key="p">dlm pull Qwen/Qwen2.5-7B-Instruct</Code>,
          ],
        ]}
      />

      <DocH2 id="large">Large — what streaming is for</DocH2>
      <DocP>
        The models dlm exists to run on consumer VRAM. Use{" "}
        <DocA href="/docs/distributed">layer streaming</DocA> and check the plan
        with <Code>dlm profile</Code> first.
      </DocP>
      <DocTable
        head={["Model", "Params", "Pull"]}
        rows={[
          [
            "Llama 3.3 70B Instruct",
            "70B",
            <Code key="p">dlm pull meta-llama/Llama-3.3-70B-Instruct</Code>,
          ],
          [
            "Qwen2.5 72B Instruct",
            "72B",
            <Code key="p">dlm pull Qwen/Qwen2.5-72B-Instruct</Code>,
          ],
        ]}
      />

      <DocNote>
        Gated repos (like Meta&rsquo;s Llama) need access on Hugging Face and a
        token — pass <Code>--token</Code> or set <Code>$HF_TOKEN</Code>. Only
        safetensors checkpoints load; see{" "}
        <DocA href="/docs/models">Model support</DocA>.
      </DocNote>

      <DocH2 id="find">Find your own</DocH2>
      <DocP>Search the hub and pull whatever matches — safetensors only:</DocP>
      <div className="mt-5 space-y-2.5">
        <CopyCommand command="dlm search llama-3" />
        <CopyCommand command="dlm pull <org/model>" />
      </div>

      <DocPager prev={prev} next={next} />
    </>
  );
}

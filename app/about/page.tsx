import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "About",
  description:
    "The naming story, the phase roadmap, the Apache-2.0 license, and links to the specs and PRD.",
};

export default function About() {
  return (
    <PagePlaceholder
      eyebrow="Story & roadmap"
      title="Why it's called dlm."
      intro="dlm is short for Dynamic LLM: the model loads dynamically, streaming layers through VRAM at the microsecond level instead of resident-loading the whole thing. Here's the story, the roadmap, and where to read the specs."
      outline={[
        "The naming story — Dynamic LLM: streaming layers, not loading them",
        "Phase 1 → 2 → 3 roadmap",
        "Apache-2.0 license",
        "Links to PRD.md, specs.md, and the repo",
      ]}
    />
  );
}

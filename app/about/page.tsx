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
      title="Why it's called flip."
      intro="The name is the mechanic: layers flipping through VRAM at the microsecond level. Here's the story, the roadmap, and where to read the specs."
      outline={[
        "The naming story — flipping layers, not loading them",
        "Phase 1 → 2 → 3 roadmap",
        "Apache-2.0 license",
        "Links to PRD.md, specs.md, and the repo",
      ]}
    />
  );
}

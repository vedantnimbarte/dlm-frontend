import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ModelsBrowser } from "@/components/ModelsBrowser";

export const metadata: Metadata = {
  title: "Models",
  description:
    "Search the Hugging Face hub and copy a ready-to-run dlm pull command — paste it in your terminal to download the model locally.",
};

export default function Models() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="shell py-16 sm:py-20">
          <Reveal>
            <span className="eyebrow">Models</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              Find a model. Copy the pull command. Run it.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-muted">
              Search the Hugging Face hub below, copy the{" "}
              <span className="font-mono text-text">dlm pull</span> command, and
              paste it in your terminal — dlm downloads only the files it needs.
              It loads safetensors checkpoints.
            </p>
          </Reveal>

          <Reveal delay={90} className="mt-10 max-w-2xl">
            <ModelsBrowser />
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

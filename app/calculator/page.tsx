import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { VramCalculator } from "@/components/VramCalculator";

export const metadata: Metadata = {
  title: "VRAM Calculator",
  description:
    "Enter your GPU VRAM, model size, quantization, and context length to see how many transformer layers stay resident, the largest model you can run, and an estimated tok/s.",
};

export default function Calculator() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="shell py-16 sm:py-20">
          <Reveal>
            <span className="eyebrow">Calculator</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              What can your GPU run?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-muted">
              Pick your VRAM, model size, quantization, and context. See how many
              layers stay resident, the largest model dlm can stream on your
              hardware, and a rough tok/s.
            </p>
          </Reveal>

          <Reveal delay={90} className="mt-10 max-w-4xl">
            <Suspense fallback={null}>
              <VramCalculator />
            </Suspense>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

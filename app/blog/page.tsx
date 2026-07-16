import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { POSTS, formatDate } from "@/components/blogPosts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing about layer streaming, VRAM budgets, and building an inference engine that runs massive models on consumer GPUs.",
};

export default function Blog() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="shell pb-4 pt-20 sm:pt-28">
          <Reveal>
            <span className="eyebrow">Writing</span>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-text">
              Notes on layer streaming.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-muted">
              Deep dives into how dlm runs massive models on the hardware you
              already have.
            </p>
          </Reveal>
        </section>

        <section className="shell pb-24 pt-8">
          <div className="flex flex-col gap-4">
            {POSTS.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="glass glass-interactive block rounded-card p-6 sm:p-7"
                >
                  <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-eyebrow text-text-muted">
                    <span>{formatDate(p.date)}</span>
                    <span aria-hidden>·</span>
                    <span>{p.readTime}</span>
                  </div>
                  <h2 className="mt-3 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-text">
                    {p.title}
                  </h2>
                  <p className="mt-2.5 max-w-2xl text-[0.92rem] leading-relaxed text-text-muted">
                    {p.excerpt}
                  </p>
                  <span className="mt-4 inline-block text-[0.85rem] text-accent-stream">
                    Read →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

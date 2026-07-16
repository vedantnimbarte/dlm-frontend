import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Not found",
  description: "That page streamed out of VRAM and never came back.",
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/get-started", label: "Get started" },
  { href: "/how-it-works", label: "How it works" },
];

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="shell flex min-h-[60vh] flex-col justify-center py-20">
          <span className="eyebrow">404</span>
          <h1 className="mt-4 max-w-2xl font-display text-[clamp(1.75rem,3.9vw,2.85rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-text">
            This page isn&rsquo;t resident.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-text-muted">
            It streamed out of VRAM and never came back. Try one of these
            instead:
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn-primary">
              Back home
            </Link>
            {LINKS.slice(1).map((l) => (
              <Link key={l.href} href={l.href} className="btn-secondary">
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

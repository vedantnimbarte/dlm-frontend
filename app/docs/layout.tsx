import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";
import { DocToc } from "@/components/DocToc";

export const metadata: Metadata = {
  title: {
    default: "Docs",
    template: "%s · dlm docs",
  },
  description:
    "dlm documentation — CLI reference, the OpenAI-compatible HTTP API, build features and configuration, and the streaming architecture.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div className="shell flex flex-col gap-8 py-10 sm:py-14 lg:flex-row lg:gap-12">
        <DocsSidebar />
        <main id="main" className="min-w-0 max-w-3xl flex-1">
          {children}
        </main>
        <DocToc />
      </div>
      <Footer />
    </>
  );
}

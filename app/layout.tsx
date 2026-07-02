import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = "https://flip.dev";
const description =
  "flip streams transformer layers in and out of your GPU as it computes — so a 70B model runs on 16 GB of VRAM. Open-source Rust inference engine.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "flip — Run a 70B model on 16 GB of VRAM",
    template: "%s · flip",
  },
  description,
  keywords: [
    "LLM inference",
    "layer streaming",
    "local LLM",
    "70B on consumer GPU",
    "Rust inference engine",
    "VRAM",
  ],
  openGraph: {
    title: "flip — Run a 70B model on 16 GB of VRAM",
    description,
    url: siteUrl,
    siteName: "flip",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "flip — Run a 70B model on 16 GB of VRAM",
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-accent-stream focus:px-4 focus:py-2 focus:text-[#04110f]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

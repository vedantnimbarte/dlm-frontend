import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuroraBackground } from "@/components/AuroraBackground";
import { PointerSheen } from "@/components/PointerSheen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
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
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <AuroraBackground />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        {children}
        <PointerSheen />
      </body>
    </html>
  );
}

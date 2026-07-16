import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuroraBackground } from "@/components/AuroraBackground";
import { PointerSheen } from "@/components/PointerSheen";
import { SITE_URL } from "@/lib/site";

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

const siteUrl = SITE_URL;
const title = "dlm — Run models bigger than your VRAM";
const description =
  "dlm quantizes transformer weights at load and streams what still doesn't fit, so your GPU runs models above its weight class — 4, 6, 8, 16 GB or more. Open-source Rust inference engine.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · dlm",
  },
  description,
  keywords: [
    "LLM inference",
    "layer streaming",
    "local LLM",
    "quantization",
    "int4",
    "run LLM on small GPU",
    "Rust inference engine",
    "VRAM",
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "dlm",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
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

import type { MetadataRoute } from "next";

const base = "https://dlm.dev";
const routes = [
  "",
  "/how-it-works",
  "/benchmarks",
  "/models",
  "/get-started",
  "/about",
  "/docs",
  "/docs/install",
  "/docs/recommended-models",
  "/docs/clients",
  "/docs/editors",
  "/docs/tutorials",
  "/docs/distributed",
  "/docs/performance",
  "/docs/deployment",
  "/docs/troubleshooting",
  "/docs/cli",
  "/docs/config",
  "/docs/api",
  "/docs/errors",
  "/docs/models",
  "/docs/quantization",
  "/docs/build",
  "/docs/library",
  "/docs/glossary",
  "/docs/concepts",
  "/docs/contributing",
  "/docs/changelog",
  "/blog",
  "/blog/layer-streaming",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}

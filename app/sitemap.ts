import type { MetadataRoute } from "next";

const base = "https://dlm.dev";
const routes = [
  "",
  "/how-it-works",
  "/benchmarks",
  "/get-started",
  "/about",
  "/docs",
  "/docs/install",
  "/docs/clients",
  "/docs/distributed",
  "/docs/performance",
  "/docs/deployment",
  "/docs/troubleshooting",
  "/docs/cli",
  "/docs/config",
  "/docs/api",
  "/docs/models",
  "/docs/build",
  "/docs/library",
  "/docs/glossary",
  "/docs/concepts",
  "/docs/contributing",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}

import type { MetadataRoute } from "next";

const base = "https://dlm.dev";
const routes = ["", "/how-it-works", "/benchmarks", "/get-started", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}

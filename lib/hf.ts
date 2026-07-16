// Hugging Face hub queries, called straight from the browser.
//
// This used to be a pair of Next route handlers proxying the hub server-side.
// The site is a static export on GitHub Pages, so there is no server to proxy
// through — the hub sends permissive CORS headers, so the browser calls it
// directly. Tradeoff: each visitor's IP hits the hub itself, and we lose the
// shared edge cache the proxy gave us.

const HF = "https://huggingface.co/api/models";

export interface HfModel {
  id: string;
  downloads: number;
  likes: number;
  pipeline_tag: string | null;
  safetensors: boolean;
}

// Category → HF query. `filter` is a real HF pipeline_tag; `search` biases the
// results toward a sub-type ("coding"/"research" aren't pipeline tags, so we
// approximate them with a keyword on top of text-generation). Keep the keys in
// sync with CATEGORIES in components/ModelsBrowser.tsx.
const CATEGORIES: Record<string, { filter?: string; search?: string }> = {
  all: { filter: "text-generation" },
  coding: { filter: "text-generation", search: "code" },
  reasoning: { filter: "text-generation", search: "reasoning" },
  chat: { filter: "text-generation", search: "instruct" },
  image: { filter: "text-to-image" },
  embedding: { filter: "sentence-similarity" },
  speech: { filter: "automatic-speech-recognition" },
};

interface RawModel {
  id?: string;
  modelId?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
}

async function get(params: URLSearchParams, signal?: AbortSignal): Promise<RawModel[]> {
  const r = await fetch(`${HF}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!r.ok) throw new Error("The Hugging Face hub is unavailable.");
  const data: unknown = await r.json();
  return Array.isArray(data) ? (data as RawModel[]) : [];
}

/** Most-downloaded models for a category, optionally narrowed by a search term. */
export async function fetchModels(
  category: string,
  q: string,
  signal?: AbortSignal
): Promise<HfModel[]> {
  const cat = CATEGORIES[category] ?? CATEGORIES.all;
  const params = new URLSearchParams({
    sort: "downloads",
    direction: "-1",
    limit: "30",
  });
  if (cat.filter) params.set("filter", cat.filter);
  // The user's own search wins over the category's implicit keyword bias.
  const search = q.trim() || cat.search;
  if (search) params.set("search", search);

  return (await get(params, signal))
    .map((m) => {
      const id = m.id ?? m.modelId ?? "";
      return {
        id,
        downloads: m.downloads ?? 0,
        likes: m.likes ?? 0,
        pipeline_tag: m.pipeline_tag ?? null,
        safetensors: Array.isArray(m.tags) && m.tags.includes("safetensors"),
      };
    })
    .filter((m) => m.id);
}

/**
 * Top providers (authors) on the hub — derived from a large batch of the
 * most-downloaded text-generation models, deduped in download order.
 */
export async function fetchProviders(signal?: AbortSignal): Promise<string[]> {
  const params = new URLSearchParams({
    sort: "downloads",
    direction: "-1",
    limit: "300",
    filter: "text-generation",
  });

  const seen = new Set<string>();
  for (const m of await get(params, signal)) {
    const author = (m.id ?? m.modelId ?? "").split("/")[0];
    if (author) seen.add(author);
    if (seen.size >= 50) break;
  }
  return [...seen];
}

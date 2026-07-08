// Proxy Hugging Face model search — server-side, so the browser avoids CORS and
// the hub sees one cached origin rather than every visitor's IP.
const HF = "https://huggingface.co/api/models";

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

interface HfModel {
  id?: string;
  modelId?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const categoryKey = url.searchParams.get("category") ?? "all";
  const cat = CATEGORIES[categoryKey] ?? CATEGORIES.all;

  const params = new URLSearchParams({
    sort: "downloads",
    direction: "-1",
    limit: "30",
  });
  if (cat.filter) params.set("filter", cat.filter);
  // The user's own search wins over the category's implicit keyword bias.
  const search = q || cat.search;
  if (search) params.set("search", search);

  try {
    const r = await fetch(`${HF}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      // Cache each query for 5 minutes at the edge.
      next: { revalidate: 300 },
    });
    if (!r.ok) {
      return Response.json({ error: "The Hugging Face hub is unavailable." }, { status: 502 });
    }
    const data: HfModel[] = await r.json();
    const models = (Array.isArray(data) ? data : [])
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

    return Response.json({ models });
  } catch {
    return Response.json({ error: "The Hugging Face hub is unavailable." }, { status: 502 });
  }
}

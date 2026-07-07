// Proxy Hugging Face model search — server-side, so the browser avoids CORS and
// the hub sees one cached origin rather than every visitor's IP.
const HF = "https://huggingface.co/api/models";

interface HfModel {
  id?: string;
  modelId?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  const params = new URLSearchParams({
    sort: "downloads",
    direction: "-1",
    limit: "30",
    filter: "text-generation",
  });
  if (q) params.set("search", q);

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
    const models = (Array.isArray(data) ? data : []).map((m) => {
      const id = m.id ?? m.modelId ?? "";
      return {
        id,
        downloads: m.downloads ?? 0,
        likes: m.likes ?? 0,
        pipeline_tag: m.pipeline_tag ?? null,
        safetensors: Array.isArray(m.tags) && m.tags.includes("safetensors"),
      };
    }).filter((m) => m.id);

    return Response.json({ models });
  } catch {
    return Response.json({ error: "The Hugging Face hub is unavailable." }, { status: 502 });
  }
}

// Top providers (authors) on the hub — derived from a large batch of the most-
// downloaded text-generation models, deduped in download order. Cached for an
// hour since the leaderboard moves slowly.
const HF = "https://huggingface.co/api/models";

export async function GET() {
  const params = new URLSearchParams({
    sort: "downloads",
    direction: "-1",
    limit: "300",
    filter: "text-generation",
  });

  try {
    const r = await fetch(`${HF}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) {
      return Response.json({ error: "The Hugging Face hub is unavailable." }, { status: 502 });
    }
    const data: { id?: string; modelId?: string }[] = await r.json();

    const seen = new Set<string>();
    const providers: string[] = [];
    for (const m of Array.isArray(data) ? data : []) {
      const author = (m.id ?? m.modelId ?? "").split("/")[0];
      if (author && !seen.has(author)) {
        seen.add(author);
        providers.push(author);
      }
      if (providers.length >= 50) break;
    }

    return Response.json({ providers });
  } catch {
    return Response.json({ error: "The Hugging Face hub is unavailable." }, { status: 502 });
  }
}

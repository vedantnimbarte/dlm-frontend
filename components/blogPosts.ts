// Blog post index — one entry per post. Dates are stamped by hand (no runtime
// clock available at build).
export interface Post {
  slug: string;
  title: string;
  date: string; // ISO
  readTime: string;
  excerpt: string;
}

export const POSTS: Post[] = [
  {
    slug: "layer-streaming",
    title: "Layer streaming: running a 70B model on 16 GB of VRAM",
    date: "2026-07-07",
    readTime: "6 min",
    excerpt:
      "Resident loading assumes every weight sits in VRAM at once. Drop that assumption and a 70B model fits on a consumer card. Here's how layer streaming works, end to end.",
  },
];

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

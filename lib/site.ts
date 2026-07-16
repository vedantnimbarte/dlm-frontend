// Canonical public location, in one place — metadata, sitemap, robots,
// llms.txt and image srcs all derive from these.
//
// GitHub Pages serves this repo under its own name, so the site lives at a
// subpath rather than a domain root.
//
// BASE_PATH must match `basePath` in next.config.mjs. Next prefixes it onto
// routes and `next/link` hrefs automatically, but NOT onto a `next/image` src
// when `images.unoptimized` is set — the raw src is passed straight through. So
// any image src has to prefix it explicitly (see components/Logo.tsx).
//
// Moving to a custom domain at the root: set BASE_PATH to "", drop `basePath`
// from next.config.mjs, and point SITE_URL at the new origin.
export const BASE_PATH = "/dlm-frontend";

export const SITE_URL = `https://vedantnimbarte.github.io${BASE_PATH}`;

/** Prefix a root-relative public asset path with the deployment's base path. */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** @type {import('next').NextConfig} */

// GitHub Pages serves this repo at
// https://vedantnimbarte.github.io/dlm-frontend — a repo-name subpath, not the
// domain root — so every route and asset needs the prefix.
//
// Hardcoded rather than read from an env var on purpose: a build that forgot
// the var would silently ship a site whose every link 404s. `next dev` also
// serves under /dlm-frontend, so local matches production.
//
// Keep in sync with SITE_URL in lib/site.ts. Moving to a custom domain at the
// root means dropping `basePath` here and updating SITE_URL there.
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project (a stray lockfile lives in the parent).
  outputFileTracingRoot: import.meta.dirname,

  // Pages is a static file host — no Node server, so pre-render everything.
  output: "export",
  basePath: "/dlm-frontend",
  // Emit `about/index.html` rather than `about.html`, so Pages serves /about
  // directly instead of 404ing on the extensionless path.
  trailingSlash: true,
  // next/image's default loader optimizes on request, which needs a server.
  images: { unoptimized: true },
};

export default nextConfig;

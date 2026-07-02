/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project (a stray lockfile lives in the parent).
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;

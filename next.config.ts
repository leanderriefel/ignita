import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["src"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    //nodeMiddleware: true,
    reactCompiler: true,
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ]
  },
  skipTrailingSlashRedirect: true,
}

export default nextConfig

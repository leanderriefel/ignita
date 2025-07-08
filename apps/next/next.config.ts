import { resolve } from "path"
import type { NextConfig } from "next"
import { config } from "dotenv"

// Load root .env file into Next.js process
config({
  path: resolve(process.cwd(), "../../.env"),
  quiet: true,
})

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ignita/components",
    "@ignita/auth",
    "@ignita/trpc",
    "@ignita/database",
    "@ignita/lib",
    "@ignita/hooks",
    "@ignita/router",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
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

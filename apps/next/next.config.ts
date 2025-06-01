import { resolve } from "path"
import type { NextConfig } from "next"
import { config } from "dotenv"

// Load root .env file into Next.js process
config({ path: resolve(process.cwd(), "../../.env") })

const nextConfig: NextConfig = {
  transpilePackages: [
    "@nuotes/components",
    "@nuotes/auth",
    "@nuotes/trpc",
    "@nuotes/database",
    "@nuotes/lib",
  ],
  eslint: {
    ignoreDuringBuilds: true,
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

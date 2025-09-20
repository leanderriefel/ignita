import { createRequire } from "module"
import { resolve } from "path"
import type { NextConfig } from "next"
import { config } from "dotenv"

// Load root .env file into Next.js process
config({
  path: resolve(process.cwd(), "../../.env"),
  quiet: true,
})

const require = createRequire(import.meta.url)

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ignita/components",
    "@ignita/auth",
    "@ignita/trpc",
    "@ignita/database",
    "@ignita/lib",
    "@ignita/hooks",
    "@ignita/router",
    "styled-jsx",
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
  webpack(config) {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      react: require.resolve("react"),
      "react/jsx-runtime": require.resolve("react/jsx-runtime"),
      "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime"),
      "react-dom": require.resolve("react-dom"),
      "react-dom/client": require.resolve("react-dom/client"),
      "react-dom/server": require.resolve("react-dom/server"),
    }
    return config
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

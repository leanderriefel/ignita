import { resolve } from "path"
import { config } from "dotenv"
import type { NextConfig } from "next"

// Load root .env file into Next.js process
config({ path: resolve(process.cwd(), "../../.env") })

const isProd = process.env.NODE_ENV === "production"

const internalHost = process.env.TAURI_DEV_HOST ?? "localhost"

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? undefined : `http://${internalHost}:4000`,
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
  skipTrailingSlashRedirect: true,
}

export default nextConfig

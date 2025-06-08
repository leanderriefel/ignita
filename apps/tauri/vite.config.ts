/// <reference types="vite/client" />

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    tsconfigPaths({ root: "../../" }),
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host ?? false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    fs: {
      allow: ["../../"],
    },
  },

  optimizeDeps: {
    exclude: [
      "@ignita/auth",
      "@ignita/components",
      "@ignita/database",
      "@ignita/lib",
      "@ignita/trpc",
      "@ignita/posthog",
      "@ignita/hooks",
    ],
  },

  envPrefix: ["VITE_", "TAURI_ENV_*"],

  build: {
    target:
      process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
})

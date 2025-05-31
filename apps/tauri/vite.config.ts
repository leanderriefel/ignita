/// <reference types="vite/client" />

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

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
    port: 4000,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    fs: {
      allow: ["../../"],
    },
  },

  optimizeDeps: {
    exclude: [
      "@nuotes/auth",
      "@nuotes/components",
      "@nuotes/database",
      "@nuotes/lib",
      "@nuotes/trpc",
    ],
  },

  envPrefix: ["VITE_", "TAURI_"],

  build: {
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
})

import { defineConfig } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), nitro(), tailwindcss(), tanstackStart(), viteReact()],
  // Oxlint — via Vite+
  lint: {
    ignorePatterns: [
      ".output/**",
      "node_modules/**",
      ".tanstack/**",
      ".qa/**",
      "src/routeTree.gen.ts",
    ],
  },
  // Oxfmt — Prettier-compatible
  fmt: {
    semi: true,
    singleQuote: false,
    ignorePatterns: [
      "src/routeTree.gen.ts",
      ".output/**",
      ".tanstack/**",
      "node_modules/**",
      ".qa/**",
    ],
  },
  // Vitest — via Vite+
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});

export default config;

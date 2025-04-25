import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
    ],
  },
])

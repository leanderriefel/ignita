const baseConfig = require("@nuotes/eslint/base")
const nextjsConfig = require("@nuotes/eslint/next")

module.exports = [
  {
    ignores: ["**/.next/**", "**/dist/**", "**/.turbo/**"],
  },
  // Use the Next.js configuration directly
  ...nextjsConfig,
  // Override for specific project settings
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
]

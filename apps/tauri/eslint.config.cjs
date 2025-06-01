const baseConfig = require("@ignita/eslint/base")
const reactConfig = require("@ignita/eslint/react")

module.exports = [
  {
    ignores: [
      "**/dist/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/build/**",
    ],
  },
  // Use the React configuration
  reactConfig,
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

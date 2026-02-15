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
]

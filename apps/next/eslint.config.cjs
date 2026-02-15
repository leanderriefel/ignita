const nextjsConfig = require("@ignita/eslint/next")

module.exports = [
  {
    ignores: ["**/.next/**", "**/dist/**", "**/.turbo/**"],
  },
  // Use the Next.js configuration directly
  ...nextjsConfig,
]

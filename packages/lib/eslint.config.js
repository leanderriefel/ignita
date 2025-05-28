const baseConfig = require("@nuotes/eslint/base")
const globals = require("globals")

module.exports = [
  {
    ignores: ["**/dist/**", "**/.turbo/**"],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    ...baseConfig,
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: {
        ...baseConfig.languageOptions.globals,
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...baseConfig,
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: {
        ...baseConfig.languageOptions.globals,
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ...baseConfig.languageOptions.parserOptions,
        project: "./tsconfig.json",
      },
    },
  },
]

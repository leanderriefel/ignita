const baseConfig = require("@ignita/eslint/base")
const nodeConfig = require("@ignita/eslint/node")
const globals = require("globals")

module.exports = [
  {
    ignores: ["**/dist/**", "**/.turbo/**"],
  },
  // JavaScript files - use base config
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
  // TypeScript files - use node config with project
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...nodeConfig,
    languageOptions: {
      ...nodeConfig.languageOptions,
      globals: {
        ...nodeConfig.languageOptions.globals,
        ...globals.browser,
      },
      parserOptions: {
        ...nodeConfig.languageOptions?.parserOptions,
        project: "./tsconfig.json",
      },
    },
  },
]

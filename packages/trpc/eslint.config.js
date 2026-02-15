const baseConfig = require("@ignita/eslint/base")
const nodeConfig = require("@ignita/eslint/node")
const globals = require("globals")

module.exports = [
  {
    ignores: ["**/dist/**", "**/.turbo/**"],
  },
  // JavaScript files - use base config with node globals
  {
    files: ["**/*.js", "**/*.jsx"],
    ...baseConfig,
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: {
        ...baseConfig.languageOptions.globals,
        ...globals.node,
      },
    },
  },
  // TypeScript files - use full node config
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...nodeConfig,
    languageOptions: {
      ...nodeConfig.languageOptions,
    },
  },
]

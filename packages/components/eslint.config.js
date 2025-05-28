const baseConfig = require("@nuotes/eslint/base")
const reactConfig = require("@nuotes/eslint/react")
const globals = require("globals")

module.exports = [
  {
    ignores: ["**/dist/**", "**/.turbo/**"],
  },
  // JavaScript files - use base config with node and react globals
  {
    files: ["**/*.js", "**/*.jsx"],
    ...baseConfig,
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: {
        ...baseConfig.languageOptions.globals,
        ...reactConfig.languageOptions.globals,
        ...globals.node,
      },
    },
  },
  // TypeScript files - use full react config with project
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...reactConfig,
    languageOptions: {
      ...reactConfig.languageOptions,
      globals: {
        ...reactConfig.languageOptions.globals,
        // Add process for environment variables
        process: "readonly",
      },
      parserOptions: {
        ...reactConfig.languageOptions.parserOptions,
        project: "./tsconfig.json",
      },
    },
  },
]

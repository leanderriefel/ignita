const baseConfig = require("./base.js")
const globals = require("globals")

module.exports = {
  ...baseConfig,
  languageOptions: {
    ...baseConfig.languageOptions,
    globals: {
      ...baseConfig.languageOptions.globals,
      ...globals.node,
    },
  },
  rules: {
    ...baseConfig.rules,
    // TypeScript type-aware rules (require project config)
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
  },
}

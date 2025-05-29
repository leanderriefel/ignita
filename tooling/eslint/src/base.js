const globals = require("globals")

module.exports = {
  languageOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    globals: {
      ...globals.node,
    },
  },
  rules: {
    // Base rules
    "no-console": "warn",
    "no-unused-vars": "off",
    "prefer-const": "error",
    "no-var": "error",
  },
}

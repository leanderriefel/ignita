const baseConfig = require("@nuotes/eslint/base")
const nextjsConfig = require("@nuotes/eslint/nextjs")
const globals = require("globals")

module.exports = [
  {
    ignores: ["**/.next/**", "**/dist/**", "**/.turbo/**"],
  },
  // JavaScript files - use base config with React globals
  {
    files: ["**/*.js", "**/*.jsx"],
    ...baseConfig,
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: {
        ...baseConfig.languageOptions.globals,
        ...nextjsConfig.languageOptions.globals,
        ...globals.node,
      },
    },
    plugins: {
      ...baseConfig.plugins,
      ...nextjsConfig.plugins,
    },
    rules: {
      ...baseConfig.rules,
      // Only non-type-aware Next.js rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-unwanted-polyfillio": "error",
      "@next/next/no-page-custom-font": "error",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-title-in-document-head": "error",
      "@next/next/no-css-tags": "error",
      "@next/next/no-head-element": "error",
      "@next/next/inline-script-id": "error",
      "@next/next/no-styled-jsx-in-document": "error",
      "@next/next/no-document-import-in-page": "error",
      "@next/next/no-head-import-in-document": "error",
      "@next/next/no-script-component-in-head": "error",
      "@next/next/no-before-interactive-script-outside-document": "error",
    },
  },
  // TypeScript files - use full Next.js config with project
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...nextjsConfig,
    languageOptions: {
      ...nextjsConfig.languageOptions,
      globals: {
        ...nextjsConfig.languageOptions.globals,
        ...globals.node,
      },
      parserOptions: {
        ...nextjsConfig.languageOptions.parserOptions,
        project: "./tsconfig.json",
      },
    },
  },
]

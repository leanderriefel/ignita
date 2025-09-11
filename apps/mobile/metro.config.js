const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)

config.resolver.unstable_enablePackageExports = true

module.exports = withNativeWind(config, {
  input: "./src/app/global.css",
  inlineRem: 16,
})

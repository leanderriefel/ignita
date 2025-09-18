const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

require("@expo/env").loadProjectEnv(workspaceRoot, { force: true })

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.disableHierarchicalLookup = true
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, "node_modules"),
  path.join(workspaceRoot, "node_modules"),
]
config.resolver.extraNodeModules = {
  react: path.join(projectRoot, "node_modules/react"),
  "react-dom": path.join(projectRoot, "node_modules/react-dom"),
}

config.resolver.unstable_enablePackageExports = true

module.exports = withNativeWind(config, {
  input: "./src/app/global.css",
  inlineRem: 16,
})


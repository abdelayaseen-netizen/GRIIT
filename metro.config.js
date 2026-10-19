const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Build 92 11.1: stamp the moment the bundle starts running (right after InitializeCore), so the
// startup trace can split native launch from bundle load. The module is also imported by app/_layout.tsx,
// which keeps it in the graph.
const bundleStart = require.resolve("./lib/bundle-start.js");
const runBefore = config.serializer.getModulesRunBeforeMainModule;
config.serializer.getModulesRunBeforeMainModule = (...args) => {
  const mods = runBefore(...args);
  return [mods[0], bundleStart, ...mods.slice(1)];
};

module.exports = config;

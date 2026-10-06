const { execSync } = require("node:child_process");
const appJson = require("./app.json");

function commit() {
  const fromEnv = process.env.EAS_BUILD_GIT_COMMIT_HASH || process.env.GIT_COMMIT || "";
  if (fromEnv) return String(fromEnv).slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      commit: commit(),
    },
  },
});

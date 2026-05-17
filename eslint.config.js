const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "scripts/audit/**", ".expo/**"],
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: { __dirname: "readonly", __filename: "readonly", module: "readonly", require: "readonly", exports: "writable" },
    },
  },
]);

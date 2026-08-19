import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Live-DB integration tests. No hardcoded env — loads real credentials from the
 * process environment / .env (via tests/integration/setup.ts).
 * Do not use for the default `npm test` suite.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    // Integration tests hit a live project; keep them serial and generous.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

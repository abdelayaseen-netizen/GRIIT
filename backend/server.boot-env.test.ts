import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("boot service-role env", () => {
  it("logs one error naming each missing variable and does not exit", () => {
    const src = readFileSync(resolve(__dirname, "server.ts"), "utf8");
    const start = src.indexOf("const missingServiceEnv");
    const end = src.indexOf("function toError");
    const block = src.slice(start, end);
    expect(block).toContain("EXPO_PUBLIC_SUPABASE_URL");
    expect(block).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(block).toContain("logger.error");
    expect(block).not.toContain("process.exit");
  });
});

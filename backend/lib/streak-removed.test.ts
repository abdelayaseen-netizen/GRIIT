import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "docs") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (/\.(ts|tsx|sql)$/.test(name)) acc.push(full);
  }
  return acc;
}

describe("old streak helper removed", () => {
  it("has no source file and no remaining references", () => {
    const fn = "computeNew" + "StreakCount";
    const fileRef = "backend/lib/" + "streak.ts";
    expect(existsSync(path.join(root, "backend/lib/" + "streak.ts"))).toBe(false);
    expect(existsSync(path.join(root, "backend/lib/" + "streak.test.ts"))).toBe(false);
    const hits = sourceFiles(root).filter((file) => {
      const text = readFileSync(file, "utf8");
      return text.includes(fn) || text.includes(fileRef);
    });
    expect(hits).toEqual([]);
  });
});

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const BACKEND = resolve(ROOT, "backend");
const SPEC_RE = /(?:from\s+|import\s*\(\s*|export\s+\*\s+from\s+)["']([^"']+)["']/g;

function resolveSpec(fromFile: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null;
  const base = resolve(dirname(fromFile), spec);
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")]) {
    if (existsSync(cand)) return cand;
  }
  return null;
}

function walkFrom(entry: string): {
  files: string[];
  aliasHits: { file: string; spec: string }[];
} {
  const seen = new Set<string>();
  const aliasHits: { file: string; spec: string }[] = [];
  const queue = [resolve(entry)];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file) || !existsSync(file)) continue;
    if (/\.(test|spec)\.tsx?$/.test(file)) continue;
    seen.add(file);
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(SPEC_RE)) {
      const spec = m[1]!;
      if (spec.startsWith("@/") || spec.startsWith("@backend/")) {
        aliasHits.push({ file: relative(ROOT, file), spec });
        continue;
      }
      const next = resolveSpec(file, spec);
      if (next) queue.push(next);
    }
  }
  return { files: [...seen].sort(), aliasHits };
}

describe("backend import graph (Railway tsx)", () => {
  const graph = walkFrom(join(BACKEND, "server.ts"));

  it("no file reachable from server.ts uses the Expo @/ alias", () => {
    expect(graph.aliasHits).toEqual([]);
  });

  it("lists app-side lib/ files the backend loads", () => {
    const appLib = graph.files
      .map((f) => relative(ROOT, f))
      .filter((f) => f.startsWith("lib/"))
      .sort();
    expect(appLib).toEqual([
      "lib/challenge-day.ts",
      "lib/consistency.ts",
      "lib/date-utils.ts",
      "lib/day-secure-ui.ts",
      "lib/free-challenge-limit.ts",
      "lib/home-day-total.ts",
      "lib/iana-timezone-core.ts",
      "lib/profile-update-schema.ts",
      "lib/profile-v2-badges.ts",
      "lib/profile-v2-proof-photo.ts",
      "lib/profile-v2-record.ts",
      "lib/profile-v2-visibility.ts",
      "lib/retention-config.ts",
      "lib/task-completion-result.ts",
      "lib/task-progress.ts",
    ]);
  });

  it("shared counters import nothing server-only", () => {
    for (const f of ["secured-elapsed.ts", "calendar-day.ts", "due-keys.ts"]) {
      const src = readFileSync(join(BACKEND, "lib", f), "utf8");
      expect(src, f).not.toMatch(/from ["']node:/);
      expect(src, f).not.toMatch(/supabase-server|createClient|process\.env/);
    }
  });
});

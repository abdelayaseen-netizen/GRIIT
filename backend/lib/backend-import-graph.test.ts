import { existsSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
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

/** Bare package name for a specifier. node: builtins return null (allowed). */
export function barePackageName(spec: string): string | null {
  if (spec.startsWith(".") || spec.startsWith("node:")) return null;
  if (spec.startsWith("@/") || spec.startsWith("@backend/")) return null;
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
  }
  return spec.split("/")[0] ?? spec;
}

const NODE_BUILTINS = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => m.startsWith("node:") ? m.slice(5) : m),
]);

export function isBackendAllowedPackage(spec: string, deps: ReadonlySet<string>): boolean {
  const name = barePackageName(spec);
  if (name == null) return true;
  if (NODE_BUILTINS.has(name)) return true;
  return deps.has(name);
}

function walkFrom(entry: string): {
  files: string[];
  aliasHits: { file: string; spec: string }[];
  bareHits: { file: string; spec: string }[];
} {
  const seen = new Set<string>();
  const aliasHits: { file: string; spec: string }[] = [];
  const bareHits: { file: string; spec: string }[] = [];
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
      if (!spec.startsWith(".")) {
        bareHits.push({ file: relative(ROOT, file), spec });
        continue;
      }
      const next = resolveSpec(file, spec);
      if (next) queue.push(next);
    }
  }
  return { files: [...seen].sort(), aliasHits, bareHits };
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

  it("bare specifiers resolve from backend/package.json dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(BACKEND, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    const deps = new Set(Object.keys(pkg.dependencies ?? {}));
    expect(isBackendAllowedPackage("expo-haptics", deps)).toBe(false);
    expect(isBackendAllowedPackage("react-native", deps)).toBe(false);
    expect(isBackendAllowedPackage("node:fs", deps)).toBe(true);
    expect(isBackendAllowedPackage("crypto", deps)).toBe(true);
    expect(isBackendAllowedPackage("zod", deps)).toBe(true);
    const illegal = graph.bareHits.filter((h) => !isBackendAllowedPackage(h.spec, deps));
    expect(illegal).toEqual([]);
  });

  it("shared counters import nothing server-only", () => {
    for (const f of ["secured-elapsed.ts", "calendar-day.ts", "due-keys.ts"]) {
      const src = readFileSync(join(BACKEND, "lib", f), "utf8");
      expect(src, f).not.toMatch(/from ["']node:/);
      expect(src, f).not.toMatch(/supabase-server|createClient|process\.env/);
    }
  });
});

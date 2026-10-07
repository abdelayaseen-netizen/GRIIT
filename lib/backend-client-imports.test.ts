import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "..");

/** Client-safe backend modules. Type-only supabase is allowed; value sentry/node/supabase is not. */
export const PURE_BACKEND_ALLOWLIST = [
  "backend/lib/late-join-window.ts",
  "backend/lib/calendar-day.ts",
  "backend/lib/can-view-challenge.ts",
  "backend/lib/challenge-tasks.ts",
  "backend/lib/create-task-validation.ts",
  "backend/lib/create-visibility.ts",
  "backend/lib/date-utils.ts",
  "backend/lib/due-keys.ts",
  "backend/lib/feed-activity-hydrate.ts",
  "backend/lib/finished-run.ts",
  "backend/lib/join-errors.ts",
  "backend/lib/me-stats.ts",
  "backend/lib/proof-predicate.ts",
  "backend/lib/record-days.ts",
  "backend/lib/secured-elapsed.ts",
  "backend/lib/task-model.ts",
  "backend/lib/task-time-gate.ts",
] as const;

const CLIENT_DIRS = ["app", "components", "lib", "contexts", "hooks"];

const FROM_RE =
  /(?:^|\n)\s*(?:export\s+)?import\s+(type\s+)?(?:[^'"\n]|[\r\n])*?from\s+['"]([^'"]+)['"]/g;
const AWAIT_IMPORT_RE = /(?:await|void)\s+import\(\s*['"]([^'"]+)['"]\s*\)/g;
const FORBIDDEN_VALUE_RE =
  /(?:^|\n)\s*(?:export\s+)?import\s+(?!type\s)[^;]*?from\s+['"](@sentry\/node|node:[^'"]+|@supabase\/supabase-js)['"]/g;

function walkTs(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "api" && relative(ROOT, dir) === "app") continue;
      walkTs(full, out);
      continue;
    }
    if (name.endsWith("+api.ts") || name.endsWith("+api.tsx")) continue;
    if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function resolveBackendTarget(fromFile: string, spec: string): string | null {
  let abs: string | null = null;
  if (spec.startsWith("@/backend/")) {
    abs = join(ROOT, spec.slice(2));
  } else if (spec.includes("backend/")) {
    abs = resolve(dirname(fromFile), spec);
  } else {
    return null;
  }
  const rel = relative(ROOT, abs).replace(/\\/g, "/");
  if (!rel.startsWith("backend/")) return null;
  const candidates = [
    abs,
    `${abs}.ts`,
    `${abs}.tsx`,
    join(abs, "index.ts"),
    join(abs, "index.tsx"),
  ];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) {
      return relative(ROOT, c).replace(/\\/g, "/");
    }
  }
  return rel.endsWith(".ts") || rel.endsWith(".tsx") ? rel : `${rel}.ts`;
}

function runtimeBackendImports(file: string, src: string): string[] {
  const body = stripComments(src);
  const specs: string[] = [];
  FROM_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FROM_RE.exec(body))) {
    if (m[1]) continue;
    const spec = m[2];
    if (spec) specs.push(spec);
  }
  AWAIT_IMPORT_RE.lastIndex = 0;
  while ((m = AWAIT_IMPORT_RE.exec(body))) {
    const spec = m[1];
    if (spec) specs.push(spec);
  }
  return specs
    .map((spec) => resolveBackendTarget(file, spec))
    .filter((t): t is string => t != null);
}

describe("client backend imports", () => {
  it("runtime backend imports stay on the pure allowlist", () => {
    const allow = new Set<string>(PURE_BACKEND_ALLOWLIST);
    const files = CLIENT_DIRS.flatMap((d) => walkTs(join(ROOT, d)));
    const violations: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const target of runtimeBackendImports(file, src)) {
        if (!allow.has(target)) {
          violations.push(`${relative(ROOT, file)} → ${target}`);
        }
      }
    }
    expect(violations).toEqual([]);

    const dirty: string[] = [];
    for (const rel of PURE_BACKEND_ALLOWLIST) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      const body = stripComments(src);
      FORBIDDEN_VALUE_RE.lastIndex = 0;
      if (FORBIDDEN_VALUE_RE.test(body)) dirty.push(rel);
    }
    expect(dirty).toEqual([]);

    const lateJoin = readFileSync(join(ROOT, "lib/late-join.ts"), "utf8");
    expect(lateJoin).toContain("@/backend/lib/late-join-window");
    expect(lateJoin).not.toContain("@/backend/lib/join-challenge");
    const window = readFileSync(join(ROOT, "backend/lib/late-join-window.ts"), "utf8");
    expect(window).not.toMatch(/from\s+['"]/);
  });
});

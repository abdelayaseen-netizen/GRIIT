import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { SAFE, screenPadding } from "@/lib/safe-area";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (name.endsWith(".tsx") && !name.includes("+api") && !name.startsWith("_layout")) out.push(path);
  }
  return out;
}

describe("v48 safe area", () => {
  it("uses the atlas floors when the device reports 0", () => {
    expect(SAFE.top).toBe(59);
    expect(SAFE.bottom).toBe(34);
    expect(SAFE.tabTotal).toBe(83);
    expect(screenPadding({ top: 0, bottom: 0, left: 0, right: 0 }, ["top", "bottom"])).toEqual({
      paddingTop: 59,
      paddingBottom: 34,
      paddingLeft: 0,
      paddingRight: 0,
    });
  });

  it("keeps a larger device inset", () => {
    expect(screenPadding({ top: 62, bottom: 40, left: 0, right: 0 }, ["top", "bottom"]).paddingTop).toBe(62);
  });

  it("fails if an app route renders without Screen", () => {
    const routes = walk(join(__dirname, "../app"));
    const missing = routes.filter((path) => !readFileSync(path, "utf8").includes("<Screen"));
    expect(missing.map((path) => relative(join(__dirname, ".."), path))).toEqual([]);
  });
});

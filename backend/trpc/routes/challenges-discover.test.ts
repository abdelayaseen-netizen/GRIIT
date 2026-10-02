import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const DISCOVER_SRC = readFileSync(resolve(__dirname, "./challenges-discover.ts"), "utf8");

const FEATURED_COLUMNS = [
  "id",
  "title",
  "duration_days",
  "difficulty",
  "category",
  "status",
  "visibility",
  "participants_count",
  "created_at",
  "creator_id",
  "participation_type",
  "challenge_tasks (id, title, task_type, order_index, config)",
] as const;

const RECOMMENDED_COLUMNS = [
  "id",
  "title",
  "duration_days",
  "difficulty",
  "category",
  "participants_count",
  "participation_type",
  "visibility",
  "status",
  "creator_id",
] as const;

function sectionAfter(marker: string): string {
  const i = DISCOVER_SRC.indexOf(marker);
  expect(i).toBeGreaterThan(-1);
  return DISCOVER_SRC.slice(i);
}

function firstChallengesSelect(src: string): string {
  const m = src.match(/\.from\("challenges"\)[\s\S]*?\.select\(\s*(?:\/\/[^\n]*\n\s*)?"([^"]+)"/);
  expect(m?.[1]).toBeTruthy();
  return m![1]!;
}

function columns(select: string): string[] {
  const parts: string[] = [];
  let buf = "";
  let depth = 0;
  for (const ch of select) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

describe("discover challenge selects", () => {
  it("do not read challenges.cover_url and stay on the known column list", () => {
    const featured = columns(firstChallengesSelect(sectionAfter("getDiscoverFeatured")));
    const recommended = columns(firstChallengesSelect(sectionAfter("getRecommended: publicProcedure")));
    expect(featured).toEqual([...FEATURED_COLUMNS]);
    expect(recommended).toEqual([...RECOMMENDED_COLUMNS]);
    expect(featured).not.toContain("cover_url");
    expect(recommended).not.toContain("cover_url");
  });
});

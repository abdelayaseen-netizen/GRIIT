import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const RECORD_SRC = readFileSync(resolve(__dirname, "./profiles-record.ts"), "utf8");
const BACKEND_ROOT = resolve(__dirname, "../..");

const RECORD_CHECK_INS_COLUMNS = [
  "id",
  "date_key",
  "active_challenge_id",
  "task_id",
  "status",
  "photo_url",
  "proof_url",
  "completion_image_url",
  "created_at",
] as const;

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

function firstCheckInsSelect(src: string): string {
  const m = src.match(/\.from\("check_ins"\)[\s\S]*?\.select\(\s*"([^"]+)"/);
  expect(m?.[1]).toBeTruthy();
  return m![1]!;
}

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkTs(full, out);
    else if (name.endsWith(".ts") && !name.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

describe("check_ins column lock", () => {
  it("profiles.getRecord reads the columns checkins.complete writes, not proof_photo_url", () => {
    const select = firstCheckInsSelect(RECORD_SRC);
    expect(columns(select)).toEqual([...RECORD_CHECK_INS_COLUMNS]);
    expect(select).not.toContain("proof_photo_url");
  });

  it("no backend check_ins select treats proof_photo_url as a column", () => {
    const files = walkTs(BACKEND_ROOT);
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      const re = /\.from\("check_ins"\)[\s\S]{0,500}?\.select\(\s*"([^"]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        const select = m[1] ?? "";
        if (select.includes("proof_photo_url") && !select.includes("metadata->>proof_photo_url")) {
          offenders.push(`${file}: ${select}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

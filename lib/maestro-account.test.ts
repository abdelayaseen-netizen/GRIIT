import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isMaestroTestEmail } from "./maestro-account";

describe("maestro test email", () => {
  it("matches the throwaway addresses and nothing else", () => {
    expect(isMaestroTestEmail("b88like1@example.com")).toBe(true);
    expect(isMaestroTestEmail("b87delete@example.com")).toBe(true);
    expect(isMaestroTestEmail("person@example.com")).toBe(false);
  });

  it("records that starter_tasks is select-only", () => {
    const sql = readFileSync("docs/sql/pending-oct13.sql", "utf8");
    expect(sql).toContain("FOR SELECT");
    expect(sql).not.toContain("FOR ALL");
    expect(sql).toContain("service role");
  });
});

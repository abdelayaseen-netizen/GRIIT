import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("primary button labels", () => {
  it("routes Post proof, Post, and Start through ds/Button", () => {
    const review = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/ReviewStep.tsx"),
      "utf8",
    );
    expect(review).toContain('label="Post proof"');
    expect(review).toContain('from "@/components/ds/Button"');
    expect(review).not.toContain("styles.btnText");
    const log = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/LogStep.tsx"),
      "utf8",
    );
    expect(log).toContain("from \"@/components/ds/Button\"");
    expect(log).toContain("runPrimaryLabel(hasCamera)");
    expect(log).not.toContain("styles.btnText");
    expect(log).not.toContain("TaskKeypad");
  });

  it("fills the Counter Add one circle with the brand token", () => {
    const count = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/CountStep.tsx"),
      "utf8",
    );
    expect(count).toContain("backgroundColor: DS_V3.color.brand");
    expect(count).not.toContain("backgroundColor: DS_V3.color.primary");
  });
});

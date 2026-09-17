import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { eveningSecureCopy } from "./evening-secure";

describe("eveningSecureCopy", () => {
  it("uses frame 57 copy by state and keeps the count in the body", () => {
    expect(
      eveningSecureCopy({
        hour: 20,
        remaining: 6,
        total: 6,
        challenge: "Iron man",
        streak: 12,
      }),
    ).toEqual({
      title: "GRIIT",
      body: "Iron man: 6 tasks left today. Four hours to secure.",
    });
    expect(
      eveningSecureCopy({
        hour: 20,
        remaining: 2,
        total: 6,
        challenge: "Iron man",
        streak: 12,
      }),
    ).toEqual({
      title: "GRIIT",
      body: "Iron man: 2 of 6 left today. Four hours to secure.",
    });
    expect(
      eveningSecureCopy({
        hour: 20,
        remaining: 2,
        total: 6,
        challenge: "Iron man",
        streak: 12,
        cameraRemaining: 2,
      }),
    ).toEqual({
      title: "GRIIT",
      body: "Iron man: 2 left, both need a photo. Four hours to secure.",
    });
    expect(
      eveningSecureCopy({
        hour: 22,
        remaining: 2,
        total: 6,
        challenge: "Iron man",
        streak: 12,
      }),
    ).toEqual({
      title: "GRIIT",
      body: "2 left. A 12-day streak ends at midnight.",
    });
    expect(
      eveningSecureCopy({
        hour: 22,
        remaining: 3,
        total: 6,
        challenge: "Iron man",
        streak: 0,
      }),
    ).toEqual({
      title: "GRIIT",
      body: "3 left. Two hours to secure today.",
    });
  });

  it("uses the singular camera line at 1", () => {
    expect(
      eveningSecureCopy({
        hour: 20,
        remaining: 1,
        total: 6,
        challenge: "Iron man",
        streak: 4,
        cameraRemaining: 1,
      }).body,
    ).toBe("Iron man: 1 left, and it needs a photo. Four hours to secure.");
  });

  it("keeps user-facing strings in notifications and identity-copy free of exclamation marks", () => {
    const root = dirname(fileURLToPath(import.meta.url));
    const notifications = readFileSync(join(root, "notifications.ts"), "utf8");
    const identity = readFileSync(join(root, "../constants/identity-copy.ts"), "utf8");
    const quoted = /(["'`])(?:\\.|(?!\1).)*\1/g;
    for (const src of [notifications, identity]) {
      const hits = src.match(quoted) ?? [];
      expect(hits.filter((s) => s.includes("!"))).toEqual([]);
    }
  });
});

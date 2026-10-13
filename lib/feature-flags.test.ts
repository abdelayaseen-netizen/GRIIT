import { describe, expect, it } from "vitest";
import { FLAGS } from "./feature-flags";

describe("starter task flag", () => {
  it("stays off until the starter is reviewed", () => {
    expect(FLAGS.STARTER_TASK_ENABLED).toBe(false);
  });
});

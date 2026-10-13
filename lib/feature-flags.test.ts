import { describe, expect, it } from "vitest";
import { FLAGS } from "./feature-flags";

describe("starter task flag", () => {
  it("stays off until the pending starter_tasks SQL is applied", () => {
    expect(FLAGS.STARTER_TASK_ENABLED).toBe(false);
  });
});

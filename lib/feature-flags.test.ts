import { describe, expect, it } from "vitest";
import { FLAGS } from "./feature-flags";

describe("starter task flag", () => {
  it("is on after the empty-Home starter card is reviewed", () => {
    expect(FLAGS.STARTER_TASK_ENABLED).toBe(true);
  });
});

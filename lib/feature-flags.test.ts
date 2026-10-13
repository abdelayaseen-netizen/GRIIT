import { describe, expect, it } from "vitest";
import { FLAGS } from "./feature-flags";

describe("starter task flag", () => {
  it("stays off while the starter screens are not in this build", () => {
    expect(FLAGS.STARTER_TASK_ENABLED).toBe(false);
  });
});

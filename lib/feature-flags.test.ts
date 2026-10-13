import { describe, expect, it } from "vitest";
import { FLAGS } from "./feature-flags";

describe("starter task flag", () => {
  it("is on now that starter_tasks exists and writes stay on the server", () => {
    expect(FLAGS.STARTER_TASK_ENABLED).toBe(true);
  });
});

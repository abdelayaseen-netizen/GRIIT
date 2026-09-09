import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

const USER = "11111111-1111-4111-8111-111111111111";
const AC = "c0000000-0000-4000-8000-000000000003";
const CH = "d0000000-0000-4000-8000-000000000004";
const TASK = "e0000000-0000-4000-8000-000000000005";

const rpcPayload = {
  date_key: "2026-09-09",
  secured: false,
  streak: 4,
  secured_date_keys: ["2026-09-03", "2026-09-04", "2026-09-08"],
  enrollments: [
    {
      active_challenge_id: AC,
      challenge_id: CH,
      title: "Write",
      current_day: 2,
      secured_today: true,
      tasks: [
        {
          id: TASK,
          title: "500 words",
          done: true,
          require_photo: false,
          require_location: false,
          config: { required: true },
        },
      ],
    },
  ],
  remaining_challenges: 0,
};

describe("today.get", () => {
  it("passes today_state rpc payload through unchanged", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: rpcPayload, error: null });
    const caller = createTestCaller({ userId: USER, supabase: { rpc } });
    if (!caller) return;
    const result = await caller.today.get();
    expect(result).toEqual(rpcPayload);
    expect(rpc).toHaveBeenCalledWith("today_state", { p_uid: USER });
  });
});

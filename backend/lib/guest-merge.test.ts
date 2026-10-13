import { describe, expect, it } from "vitest";
import { applyGuestMerge, guestMergeWrites, type GuestMergeState } from "./guest-merge";

const FROM = "guest-user";
const TO = "real-user";

function state(): GuestMergeState {
  return {
    enrollments: [
      { id: "enr-g", user_id: FROM, challenge_id: "water", status: "active" },
      { id: "enr-d", user_id: TO, challenge_id: "read", status: "active" },
    ],
    checkIns: [
      {
        id: "ci-g",
        user_id: FROM,
        active_challenge_id: "enr-g",
        task_id: "task-1",
        date_key: "2026-10-12",
        status: "completed",
        proof_url: `${FROM}/2026-10-12/photo.jpg`,
        photo_url: null,
        completion_image_url: `https://example.test/storage/v1/object/public/task-proofs/${FROM}/2026-10-12/photo.jpg`,
      },
    ],
    events: [
      {
        id: "ev-g",
        user_id: FROM,
        metadata: { photo_url: `${FROM}/2026-10-12/photo.jpg` },
      },
    ],
    daySecures: [{ id: "day-g", user_id: FROM, date_key: "2026-10-12" }],
    storagePaths: [`${FROM}/2026-10-12/photo.jpg`],
    deletedUserIds: [],
  };
}

describe("applyGuestMerge", () => {
  it("moves enrollment, the completion, and the proof, then deletes the guest", () => {
    const next = applyGuestMerge(state(), FROM, TO);
    const enrollment = next.enrollments.find((row) => row.id === "enr-g");
    const checkIn = next.checkIns.find((row) => row.id === "ci-g");
    expect(enrollment?.user_id).toBe(TO);
    expect(checkIn?.user_id).toBe(TO);
    expect(checkIn?.proof_url).toBe(`${TO}/2026-10-12/photo.jpg`);
    expect(checkIn?.completion_image_url).toContain(`/${TO}/2026-10-12/photo.jpg`);
    expect(next.events[0]?.user_id).toBe(TO);
    expect(next.events[0]?.metadata?.photo_url).toBe(`${TO}/2026-10-12/photo.jpg`);
    expect(next.daySecures[0]?.user_id).toBe(TO);
    expect(next.storagePaths).toEqual([`${TO}/2026-10-12/photo.jpg`]);
    expect(next.deletedUserIds).toEqual([FROM]);
  });

  it("keeps the existing enrollment when both accounts joined the same challenge", () => {
    const start = state();
    start.enrollments.push({
      id: "enr-same",
      user_id: TO,
      challenge_id: "water",
      status: "active",
    });
    const next = applyGuestMerge(start, FROM, TO);
    expect(next.enrollments.find((row) => row.id === "enr-g")).toBeUndefined();
    expect(next.checkIns.find((row) => row.id === "ci-g")?.active_challenge_id).toBe("enr-same");
    expect(next.checkIns.find((row) => row.id === "ci-g")?.user_id).toBe(TO);
    expect(next.deletedUserIds).toEqual([FROM]);
  });

  it("writes the row moves before it deletes the anonymous user", () => {
    const before = state();
    const after = applyGuestMerge(before, FROM, TO);
    const writes = guestMergeWrites(before, after);
    const deleteAt = writes.findIndex((write) => write.op === "delete_user");
    expect(deleteAt).toBe(writes.length - 1);
    expect(writes[deleteAt]).toEqual({ op: "delete_user", userId: FROM });
    expect(writes.some((write) => write.op === "update" && write.table === "active_challenges")).toBe(true);
    expect(writes.some((write) => write.op === "update" && write.table === "check_ins")).toBe(true);
    expect(writes.some((write) => write.op === "move_storage")).toBe(true);
  });
});

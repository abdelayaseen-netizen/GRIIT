import { describe, expect, it } from "vitest";
import {
  circleLabel,
  proofTypeLabel,
  receiptChallengeLine,
  receiptGoalsLine,
  receiptReminderLine,
  sortDayOneTasks,
} from "@/lib/onboarding-v2-dayone";

describe("proofTypeLabel", () => {
  it("maps challenge_tasks types to PHOTO / GPS / TIMER", () => {
    expect(proofTypeLabel({ type: "photo" })).toBe("PHOTO");
    expect(proofTypeLabel({ type: "journal" })).toBe("PHOTO");
    expect(proofTypeLabel({ type: "timer" })).toBe("TIMER");
    expect(proofTypeLabel({ task_type: "run" })).toBe("GPS");
    expect(proofTypeLabel({ require_location: true })).toBe("GPS");
  });
});

describe("sortDayOneTasks", () => {
  it("orders by order_index and keeps three", () => {
    const rows = [
      { id: "c", title: "C", order_index: 2 },
      { id: "a", title: "A", order_index: 0 },
      { id: "d", title: "D", order_index: 3 },
      { id: "b", title: "B", order_index: 1 },
    ];
    expect(sortDayOneTasks(rows).map((t) => t.id)).toEqual(["a", "b", "c"]);
  });
});

describe("receipt + circle lines", () => {
  it("receipt line 1 is challenge name only", () => {
    expect(receiptChallengeLine("The 30 Reset")).toBe("The 30 Reset");
    expect(receiptChallengeLine(null)).toBe("Your challenge");
  });

  it("reminder and goal lines follow live state", () => {
    expect(receiptReminderLine(true, "am6", null)).toBe("Reminder at 6:00 AM");
    expect(receiptReminderLine(false, "am6", null)).toBe("Reminders off");
    expect(receiptGoalsLine(3)).toBe("3 goals selected");
    expect(receiptGoalsLine(0)).toBe("0 goals selected");
  });

  it("circle is Just you until invites exist", () => {
    expect(circleLabel(0)).toBe("Just you");
    expect(circleLabel(3)).toBe("3 invited");
  });
});

import { describe, expect, it } from "vitest";
import {
  TIMER_SESSION_NOT_ELAPSED,
  TIMER_SESSION_NOT_FOUND,
  assertTimerSessionElapsed,
  parseTimerSession,
} from "./timer-session";

describe("parseTimerSession", () => {
  it("reads a valid session from proof_payload_json", () => {
    const session = parseTimerSession({
      session: { started_at: "2026-09-06T01:00:00.000Z", required_seconds: 600, kind: "timer" },
    });
    expect(session).toEqual({
      started_at: "2026-09-06T01:00:00.000Z",
      required_seconds: 600,
      kind: "timer",
    });
  });

  it("returns null when the session is missing or malformed", () => {
    expect(parseTimerSession(null)).toBeNull();
    expect(parseTimerSession({})).toBeNull();
    expect(parseTimerSession({ session: { started_at: "nope", required_seconds: 60, kind: "timer" } })).toBeNull();
    expect(parseTimerSession({ session: { started_at: "2026-09-06T01:00:00.000Z", required_seconds: 0, kind: "timer" } })).toBeNull();
  });
});

describe("assertTimerSessionElapsed", () => {
  const started = "2026-09-06T01:00:00.000Z";
  const session = { started_at: started, required_seconds: 600, kind: "timer" as const };

  it("fails honestly when no session exists — does not trust the client", () => {
    const result = assertTimerSessionElapsed(null, new Date("2026-09-06T02:00:00.000Z"));
    expect(result).toEqual({ ok: false, code: "NOT_FOUND", message: TIMER_SESSION_NOT_FOUND });
  });

  it("fails while the wall clock has not reached started_at + required", () => {
    const result = assertTimerSessionElapsed(session, new Date("2026-09-06T01:09:59.000Z"));
    expect(result).toEqual({ ok: false, code: "NOT_ELAPSED", message: TIMER_SESSION_NOT_ELAPSED });
  });

  it("passes at and after the required duration", () => {
    expect(assertTimerSessionElapsed(session, new Date("2026-09-06T01:10:00.000Z")).ok).toBe(true);
    expect(assertTimerSessionElapsed(session, new Date("2026-09-06T01:10:01.000Z")).ok).toBe(true);
  });
});

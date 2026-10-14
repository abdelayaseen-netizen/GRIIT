import type { Decision } from "./types";

const ACTIONS = new Set(["tap", "type", "scroll", "back", "wait", "double_tap", "kill_app", "done"]);

export function parseDecision(raw: string): Decision | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  const action = String(rec.action ?? "").trim();
  if (!ACTIONS.has(action)) return null;
  const emotion = String(rec.emotion ?? "neutral");
  const safeEmotion = emotion === "frustrated" || emotion === "satisfied" ? emotion : "neutral";
  return {
    action,
    target: String(rec.target ?? "").trim().slice(0, 160),
    text: rec.text == null ? undefined : String(rec.text).slice(0, 200),
    thought: String(rec.thought ?? "").replace(/\s+/g, " ").trim().slice(0, 280),
    confusion: rec.confusion == null ? "" : String(rec.confusion).replace(/\s+/g, " ").trim().slice(0, 280),
    emotion: safeEmotion,
  };
}

export function reviewAction(input: {
  decision: Decision;
  screenText: string;
  allowedNames: string[];
  group: string;
}): { ok: true } | { ok: false; reason: string } {
  const target = `${input.decision.target} ${input.decision.text ?? ""}`;
  if (/apple/i.test(target)) return { ok: false, reason: "Apple sign-in is blocked so this run cannot use a personal Apple ID." };
  if (/risk losing my progress/i.test(target)) return { ok: false, reason: "Skipping account creation is blocked. Use the email and password you were given." };
  if (/subscribe|purchase|start trial|free trial|restore purchases/i.test(target)) {
    return { ok: false, reason: "Purchases are blocked. Read the paywall, then leave it." };
  }
  if (input.decision.action === "kill_app" && input.group !== "stress") {
    return { ok: false, reason: "Only stress-test agents may kill the app." };
  }
  const social = /\b(follow|following|like|liked|comment|respect|reply)\b/i.test(input.decision.target);
  const feedShare = /^share$/i.test(input.decision.target) && /respect|comment/i.test(input.screenText);
  if (social || feedShare) {
    const blob = input.screenText.toLowerCase();
    const allowed = input.allowedNames.some((name) => name && blob.includes(name.toLowerCase()));
    if (!allowed) {
      return { ok: false, reason: "Likes, comments, and follows are limited to Seed GRIIT and other agent accounts." };
    }
  }
  return { ok: true };
}

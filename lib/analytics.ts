/**
 * Analytics events for activation and retention. Replace with your provider (e.g. PostHog, Mixpanel).
 */
export type AnalyticsEvent =
  | { name: "guest_view_screen"; screen: string }
  | { name: "gate_modal_shown"; context: "join" | "secure" | "respect" | "chase" | "create" | "team" | "other" }
  | { name: "signup_completed" }
  | { name: "onboarding_step_completed"; step: number; total: number }
  | { name: "starter_challenge_selected"; challengeId: string }
  | { name: "day1_task_completed"; challengeId: string; ttfv_seconds?: number; starter_id?: string; primary_goal?: string; daily_time_budget?: string }
  | { name: "day1_secured"; challengeId: string; ttfv_seconds?: number; starter_id?: string; primary_goal?: string; daily_time_budget?: string }
  | { name: "streak_freeze_used" }
  | { name: "comeback_mode_started" }
  | { name: "comeback_day_secured" }
  | { name: "milestone_unlocked"; streak: number }
  | { name: "invite_shared"; challengeId?: string; source: "challenge_detail" | "milestone_modal" };

let _handler: ((e: AnalyticsEvent) => void) | null = null;

export function setAnalyticsHandler(handler: (e: AnalyticsEvent) => void) {
  _handler = handler;
}

export function track(event: AnalyticsEvent) {
  if (__DEV__) {
    console.log("[Analytics]", event.name, event);
  }
  _handler?.(event);
}

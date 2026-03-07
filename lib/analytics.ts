/**
 * Analytics events for activation and retention. Wire via setAnalyticsHandler to PostHog or Mixpanel.
 */
export type AnalyticsEvent =
  | { name: "app_opened" }
  | { name: "guest_view_screen"; screen: string }
  | { name: "gate_modal_shown"; context: "join" | "secure" | "respect" | "nudge" | "create" | "team" | "other" }
  | { name: "signup_started" }
  | { name: "signup_completed" }
  | { name: "onboarding_step_completed"; step: number; total: number }
  | { name: "onboarding_completed" }
  | { name: "starter_challenge_selected"; challengeId: string }
  | { name: "first_challenge_joined"; challengeId?: string }
  | { name: "first_task_completed"; challengeId?: string }
  | { name: "day1_task_completed"; challengeId: string; ttfv_seconds?: number; starter_id?: string; primary_goal?: string; daily_time_budget?: string }
  | { name: "day1_secured"; challengeId: string; ttfv_seconds?: number; starter_id?: string; primary_goal?: string; daily_time_budget?: string }
  | { name: "day_secured" }
  | { name: "nudge_sent"; toUserId?: string }
  | { name: "respect_sent"; toUserId?: string }
  | { name: "streak_lost" }
  | { name: "streak_milestone"; streak: number }
  | { name: "push_permission_granted" }
  | { name: "push_permission_denied" }
  | { name: "streak_freeze_used" }
  | { name: "streak_saved_last_stand" }
  | { name: "streak_lost_no_last_stand" }
  | { name: "last_stand_earned" }
  | { name: "comeback_mode_started" }
  | { name: "comeback_day_secured" }
  | { name: "milestone_unlocked"; streak: number }
  | { name: "invite_shared"; challengeId?: string; source: "challenge_detail" | "milestone_modal" };

export type UserProperties = {
  days_since_signup?: number;
  current_streak?: number;
  discipline_score?: number;
  timezone?: string;
  reminder_enabled?: boolean;
};

let _handler: ((e: AnalyticsEvent) => void) | null = null;
let _identify: ((userId: string, props?: UserProperties) => void) | null = null;

export function setAnalyticsHandler(handler: (e: AnalyticsEvent) => void) {
  _handler = handler;
}

export function setIdentify(identify: (userId: string, props?: UserProperties) => void) {
  _identify = identify;
}

export function identify(userId: string, props?: UserProperties) {
  _identify?.(userId, props);
}

export function track(event: AnalyticsEvent) {
  _handler?.(event);
}

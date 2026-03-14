/**
 * Analytics events for activation and retention. Forwarded to PostHog when configured.
 */
export type AnalyticsEvent =
  | { name: "app_opened"; streak_count?: number; isPremium?: boolean }
  | { name: "guest_view_screen"; screen: string }
  | { name: "gate_modal_shown"; context: "join" | "secure" | "respect" | "nudge" | "create" | "team" | "other" }
  | { name: "signup_started" }
  | { name: "signup_completed" }
  | { name: "onboarding_started" }
  | { name: "onboarding_step_completed"; step: number; total: number; step_name?: string }
  | { name: "onboarding_completed" }
  | { name: "onboarding_dropped"; last_step?: string }
  | { name: "starter_challenge_selected"; challengeId: string }
  | { name: "first_challenge_joined"; challengeId?: string }
  | { name: "first_task_completed"; challengeId?: string }
  | { name: "day1_task_completed"; challengeId: string; ttfv_seconds?: number; starter_id?: string; primary_goal?: string; daily_time_budget?: string }
  | { name: "day1_secured"; challengeId: string; ttfv_seconds?: number; starter_id?: string; primary_goal?: string; daily_time_budget?: string }
  | { name: "challenge_viewed"; challenge_id: string; challenge_name?: string }
  | { name: "challenge_joined"; challenge_id: string }
  | { name: "challenge_left"; challenge_id: string }
  | { name: "task_completed"; challenge_id?: string; task_type?: string; verification_type?: string }
  | { name: "day_secured"; streak_count?: number }
  | { name: "nudge_sent"; toUserId?: string }
  | { name: "respect_sent"; toUserId?: string }
  | { name: "streak_lost" }
  | { name: "streak_milestone"; streak: number }
  | { name: "push_permission_granted" }
  | { name: "push_permission_denied" }
  | { name: "notification_permission_granted" }
  | { name: "notification_permission_denied" }
  | { name: "streak_freeze_used" }
  | { name: "streak_saved_last_stand" }
  | { name: "streak_lost_no_last_stand" }
  | { name: "last_stand_earned" }
  | { name: "last_stand_used" }
  | { name: "comeback_mode_started" }
  | { name: "comeback_day_secured" }
  | { name: "milestone_unlocked"; streak: number }
  | { name: "invite_shared"; challengeId?: string; source: "challenge_detail" | "milestone_modal" }
  | { name: "follow_suggested_click"; username?: string }
  | { name: "share_tapped"; share_type: "challenge" | "progress" | "invite" | "profile" }
  | { name: "paywall_shown"; source: string }
  | { name: "paywall_dismissed"; source: string }
  | { name: "purchase_started"; package_type: "monthly" | "annual" }
  | { name: "purchase_completed"; package_type: string; price?: string }
  | { name: "purchase_failed"; package_type?: string; error?: string }
  | { name: "restore_attempted" }
  | { name: "restore_succeeded" };

export type UserProperties = {
  days_since_signup?: number;
  current_streak?: number;
  discipline_score?: number;
  timezone?: string;
  reminder_enabled?: boolean;
  email?: string;
  isPremium?: boolean;
  tier?: string;
};

import { getPostHog, resetPostHog } from "./posthog";

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
  const ph = getPostHog();
  if (ph) {
    try {
      ph.identify(userId);
      if (props && Object.keys(props).length > 0) {
        ph.people.set(props);
      }
    } catch {
      // ignore
    }
  }
}

export function reset() {
  resetPostHog();
}

export function track(event: AnalyticsEvent) {
  _handler?.(event);
  const ph = getPostHog();
  if (ph) {
    try {
      const { name, ...properties } = event as { name: string; [k: string]: unknown };
      ph.capture(name, properties);
    } catch {
      // ignore
    }
  }
}

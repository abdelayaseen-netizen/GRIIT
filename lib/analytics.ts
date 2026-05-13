/**
 * Analytics events for activation and retention. Forwarded to PostHog when configured.
 */
import { getPostHog, resetPostHog } from "./posthog";
import type { IdentityTier } from "@/constants/identity-copy";

export type PaywallVariant = "control" | "social_proof";
export type ReminderType =
  | "daily_streak"
  | "streak_at_risk"
  | "lapsed_3d"
  | "lapsed_7d"
  | "partner_completed"
  | "milestone_celebration"
  | "first_day_check"
  | "comeback";

type AnalyticsEvent =
  | { name: "app_opened"; streak_count?: number; isPremium?: boolean; days_since_signup?: number }
  | { name: "guest_view_screen"; screen: string }
  | { name: "gate_modal_shown"; context: "join" | "secure" | "respect" | "nudge" | "create" | "team" | "other" }
  | { name: "signup_started" }
  | { name: "signup_completed"; method?: "email" | "apple" | "google" }
  | { name: "login_completed"; method?: "email" | "apple" | "google" }
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
  | { name: "day_secured"; streak_count?: number; challenge_id?: string; day_number?: number }
  | { name: "day_3_retained"; challenge_id?: string }
  | { name: "day_7_retained"; challenge_id?: string; day_number?: number }
  | { name: "day_30_task_completed"; challenge_id?: string; day_number?: number; days_since_signup?: number }
  | { name: "screen_viewed"; screen_name?: string; screen_pattern?: string }
  | { name: "paywall_viewed"; source?: string; variant?: PaywallVariant }
  | { name: "paywall_variant_assigned"; variant: PaywallVariant }
  | { name: "paywall_offering_selected"; package_id: string; variant: PaywallVariant }
  | { name: "paywall_purchase_started"; package_id: string; variant: PaywallVariant }
  | { name: "paywall_purchase_completed"; package_id: string; variant: PaywallVariant }
  | { name: "paywall_purchase_failed"; package_id?: string; variant: PaywallVariant; error_code?: string }
  | { name: "paywall_purchase_cancelled"; package_id?: string; variant: PaywallVariant }
  | { name: "paywall_restore_tapped"; variant: PaywallVariant }
  | { name: "paywall_restore_failed"; variant: PaywallVariant; error_code?: string }
  | { name: "trial_started"; product_id?: string }
  | { name: "subscription_started"; product_id?: string }
  | { name: "subscription_cancelled" }
  | { name: "task_skipped"; challenge_id?: string; missed_days?: number }
  | { name: "challenge_abandoned"; challenge_id?: string; day?: number; day_number?: number }
  | { name: "challenge_created"; challenge_id?: string; duration_days?: number; is_hard_mode?: boolean }
  | { name: "feed_posted"; challenge_id?: string; has_photo?: boolean }
  | { name: "discover_challenge_tapped"; challenge_id?: string }
  | { name: "share_completed"; content_type?: string }
  | { name: "notification_opened"; reminder_type: ReminderType; time_to_open_ms: number }
  | { name: "notification_scheduled"; reminder_type: ReminderType; scheduled_for: string }
  | { name: "notification_sent"; reminder_type: ReminderType }
  | { name: "nudge_sent"; toUserId?: string }
  | { name: "respect_sent"; toUserId?: string }
  | { name: "streak_lost" }
  | { name: "streak_milestone"; streak: number }
  | { name: "push_permission_granted" }
  | { name: "push_permission_denied" }
  | { name: "notification_permission_granted" }
  | { name: "notification_permission_denied" }
  | { name: "notification_permission_deferred_to_post_first_day" }
  | { name: "onboarding_goals_selected"; goals: string[] }
  | { name: "onboarding_signup_completed" }
  | { name: "onboarding_profile_created" }
  | { name: "onboarding_challenge_auto_suggested"; challenge_id: string; challenge_name: string }
  | { name: "onboarding_challenge_joined"; challenge_id: string }
  | { name: "onboarding_challenge_skipped" }
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
  | { name: "image_viewer_opened"; source: "feed" | "profile_posts"; post_id?: string }
  | { name: "image_viewer_closed"; source: "feed" | "profile_posts"; duration_ms?: number; post_id?: string }
  | {
      name: "home_state_viewed";
      state: "new_user" | "day_in_progress" | "streak_at_risk" | "streak_healthy";
      streak: number;
      tasks_remaining?: number;
      minutes_to_midnight?: number;
    }
  | { name: "paywall_shown"; source: string }
  | { name: "paywall_dismissed"; source: string }
  | { name: "purchase_started"; package_type: "monthly" | "annual" }
  | { name: "purchase_completed"; package_type: string; price?: string }
  | { name: "purchase_failed"; package_type?: string; error?: string }
  | { name: "restore_attempted" }
  | { name: "restore_succeeded" }
  | { name: "challenge_completed"; challenge_name?: string; duration?: number }
  | { name: "weekly_goal_changed"; old_goal: number; new_goal: number }
  | { name: "weekly_summary_shown"; goal: number; completed: number; met_goal: boolean }
  | { name: "lapsed_notification_scheduled"; day: number }
  | { name: "milestone_approaching_notification_scheduled"; milestone_day: number }
  | { name: "user_returned_after_lapse"; lapse_days: number; days_since_signup?: number }
  | { name: "cold_start"; cold_start_ms: number }
  | { name: "cold_start_bucket"; bucket: "fast" | "ok" | "slow" | "very_slow"; cold_start_ms: number }
  | { name: "identity_line_shown"; streak_count: number; tier: IdentityTier }
  | { name: "minimum_day_completed"; challenge_id?: string; streak_count?: number; day_number?: number }
  | { name: "review_prompted"; total_days_secured: number; trigger: string };

type UserProperties = {
  days_since_signup?: number;
  current_streak?: number;
  discipline_score?: number;
  timezone?: string;
  reminder_enabled?: boolean;
  email?: string;
  isPremium?: boolean;
  tier?: string;
};

/** PostHog sends only in production unless `EXPO_PUBLIC_POSTHOG_ENABLE_DEV=true`. */
function shouldSendPostHog(): boolean {
  if (!__DEV__) return true;
  return (process.env.EXPO_PUBLIC_POSTHOG_ENABLE_DEV ?? "").trim() === "true";
}

export function identify(userId: string, props?: UserProperties) {
  if (!shouldSendPostHog()) return;
  const ph = getPostHog();
  if (ph) {
    try {
      if (props && Object.keys(props).length > 0) {
        ph.identify(userId, { $set: props });
      } else {
        ph.identify(userId);
      }
    } catch {
      // ignore
    }
  }
}

export function resetAnalytics() {
  resetPostHog();
}

type FunnelProps = Record<string, string | number | boolean | undefined>;

/** PostHog `capture` props: JSON-serializable map (no `undefined` values). */
type CaptureProps = { [key: string]: string | number | boolean | null | CaptureProps[] | { [key: string]: CaptureProps } };

function funnelPropsForCapture(properties?: FunnelProps): CaptureProps | undefined {
  if (!properties) return undefined;
  const out: CaptureProps = {};
  for (const [k, v] of Object.entries(properties)) {
    if (v !== undefined) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

function eventPayloadForCapture(rest: Record<string, unknown>): CaptureProps {
  return JSON.parse(JSON.stringify(rest)) as CaptureProps;
}

/** String-key funnel events (exact PostHog event names). Fire-and-forget. */
export function trackEvent(event: string, properties?: FunnelProps): void {
  try {
    if (!shouldSendPostHog()) return;
    const ph = getPostHog();
    if (__DEV__) console.log("[PostHog] Capturing event:", event, properties);
    ph?.capture(event, funnelPropsForCapture(properties));
  } catch {
    /* non-fatal — analytics must not break UX */
  }
}

export function track(event: AnalyticsEvent) {
  if (!shouldSendPostHog()) return;
  const ph = getPostHog();
  if (ph) {
    try {
      const { name, ...rest } = event as { name: string; [k: string]: unknown };
      ph.capture(name, eventPayloadForCapture(rest));
    } catch {
      // ignore
    }
  }
}

export function trackDay30Completed(props: {
  challenge_id?: string;
  day_number?: number;
  days_since_signup?: number;
}): void {
  track({
    name: "day_30_task_completed",
    challenge_id: props.challenge_id,
    day_number: props.day_number,
    days_since_signup: props.days_since_signup,
  });
}

export function trackAppOpened(props?: {
  streak_count?: number;
  isPremium?: boolean;
  days_since_signup?: number;
}): void {
  track({
    name: "app_opened",
    streak_count: props?.streak_count,
    isPremium: props?.isPremium,
    days_since_signup: props?.days_since_signup,
  });
}

export function trackUserReturnedAfterLapse(props: {
  lapse_days: number;
  days_since_signup?: number;
}): void {
  track({
    name: "user_returned_after_lapse",
    lapse_days: props.lapse_days,
    days_since_signup: props.days_since_signup,
  });
}

export function getPaywallVariant(): PaywallVariant {
  try {
    const ph = getPostHog() as { getFeatureFlag?: (flag: string) => unknown } | null;
    const flag = ph?.getFeatureFlag?.("paywall_variant");
    if (flag === "social_proof") return "social_proof";
    return "control";
  } catch {
    return "control";
  }
}

export function trackPaywallVariantAssigned(props: { variant: PaywallVariant }): void {
  track({ name: "paywall_variant_assigned", variant: props.variant });
}

export function trackPaywallOfferingSelected(props: { package_id: string; variant: PaywallVariant }): void {
  track({ name: "paywall_offering_selected", package_id: props.package_id, variant: props.variant });
}

export function trackPaywallPurchaseStarted(props: { package_id: string; variant: PaywallVariant }): void {
  track({ name: "paywall_purchase_started", package_id: props.package_id, variant: props.variant });
}

export function trackPaywallPurchaseCompleted(props: { package_id: string; variant: PaywallVariant }): void {
  track({ name: "paywall_purchase_completed", package_id: props.package_id, variant: props.variant });
}

export function trackPaywallPurchaseFailed(props: {
  package_id?: string;
  variant: PaywallVariant;
  error_code?: string;
}): void {
  track({
    name: "paywall_purchase_failed",
    package_id: props.package_id,
    variant: props.variant,
    error_code: props.error_code,
  });
}

export function trackPaywallPurchaseCancelled(props: {
  package_id?: string;
  variant: PaywallVariant;
}): void {
  track({
    name: "paywall_purchase_cancelled",
    package_id: props.package_id,
    variant: props.variant,
  });
}

export function trackPaywallRestoreTapped(props: { variant: PaywallVariant }): void {
  track({ name: "paywall_restore_tapped", variant: props.variant });
}

export function trackPaywallRestoreFailed(props: { variant: PaywallVariant; error_code?: string }): void {
  track({ name: "paywall_restore_failed", variant: props.variant, error_code: props.error_code });
}

export function trackColdStart(props: { cold_start_ms: number }): void {
  const coldStartMs = Math.max(0, Math.round(props.cold_start_ms));
  const bucket: "fast" | "ok" | "slow" | "very_slow" =
    coldStartMs < 1500 ? "fast" : coldStartMs < 2500 ? "ok" : coldStartMs <= 4000 ? "slow" : "very_slow";
  track({ name: "cold_start", cold_start_ms: coldStartMs });
  track({ name: "cold_start_bucket", bucket, cold_start_ms: coldStartMs });
}

export function trackNotificationScheduled(props: {
  reminder_type: ReminderType;
  scheduled_for: string;
}): void {
  track({
    name: "notification_scheduled",
    reminder_type: props.reminder_type,
    scheduled_for: props.scheduled_for,
  });
}

export function trackNotificationSent(props: { reminder_type: ReminderType }): void {
  track({ name: "notification_sent", reminder_type: props.reminder_type });
}

export function trackNotificationOpened(props: {
  reminder_type: ReminderType;
  time_to_open_ms: number;
}): void {
  track({
    name: "notification_opened",
    reminder_type: props.reminder_type,
    time_to_open_ms: Math.max(0, Math.round(props.time_to_open_ms)),
  });
}

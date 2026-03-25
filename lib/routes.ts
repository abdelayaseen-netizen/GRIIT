/**
 * Centralized route paths for type-safe navigation.
 * Use these constants instead of string literals. Use `as never` only when expo-router Href requires it.
 */
export const ROUTES = {
  AUTH: "/auth",
  AUTH_LOGIN: "/auth/login",
  AUTH_SIGNUP: "/auth/signup",
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  CREATE_PROFILE: "/create-profile",
  ONBOARDING: "/onboarding",
  ONBOARDING_STEP4: "/onboarding?step=4",
  TABS: "/(tabs)",
  TABS_HOME: "/(tabs)",
  TABS_DISCOVER: "/(tabs)/discover",
  TABS_CREATE: "/(tabs)/create",
  /** Full-screen challenge creation wizard (hides tab bar). */
  CREATE_WIZARD: "/create",
  TABS_PROFILE: "/(tabs)/profile",
  TABS_ACTIVITY: "/(tabs)/activity",
  TABS_SETTINGS: "/settings",
  EDIT_PROFILE: "/edit-profile",
  SETTINGS: "/settings",
  ACCOUNTABILITY: "/accountability",
  ACCOUNTABILITY_ADD: "/accountability/add",
  ACCOUNTABILITY_ADD_DAY1: "/accountability/add?from=day1",
  CHALLENGE_ID: (id: string) => `/challenge/${id}` as const,
  /** Active challenge detail (post-join); use activeChallengeId from active_challenges.id */
  CHALLENGE_ACTIVE: (activeChallengeId: string) => `/challenge/active/${activeChallengeId}` as const,
  PROFILE_USERNAME: (username: string) => `/profile/${username}` as const,
  INVITE_CODE: (code: string) => `/invite/${code}` as const,
  TASK_JOURNAL: "/task/journal",
  TASK_PHOTO: "/task/photo",
  TASK_MANUAL: "/task/manual",
  TASK_COMPLETE: "/task/complete",
  TASK_CHECKIN: "/task/checkin",
  TASK_RUN: "/task/run",
  TASK_TIMER: "/task/timer",
  CHAT_INFO: (id: string) => `/challenge/${id}/chat-info` as const,
  CHALLENGE_COMPLETE: "/challenge/complete",
  PAYWALL: "/paywall",
  LEGAL_PRIVACY: "/legal/privacy-policy",
  LEGAL_TERMS: "/legal/terms",
} as const;

/** Segment names for auth redirect logic (first segment of path). */
export const SEGMENTS = {
  AUTH: "auth",
  CREATE_PROFILE: "create-profile",
  ONBOARDING: "onboarding",
} as const;

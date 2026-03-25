/**
 * Centralized AsyncStorage keys for the GRIIT app.
 * Use these constants instead of hardcoded strings.
 */

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  HAS_LAUNCHED: 'griit_has_launched',
  ONBOARDING_STORE: 'griit-onboarding',
  PENDING_CHALLENGE_ID: 'griit_pending_challenge_id',
  ONBOARDING_ANSWERS: 'griit_onboarding_answers',
  FIRST_SESSION_FINISHED: 'griit_first_session_just_finished',
  JOINED_CHALLENGES: 'griit_joined_challenge_ids',
  DAY1_STARTED_AT: 'griit_day1_started_at',
  CELEBRATION_SHOWN: 'griit_celebrations_shown_v1',
  REVIEW_PROMPT_LAST: 'griit_review_prompt_last',
  REVIEW_LAST_ASKED: 'griit_review_last_asked',
  /** Set after first successful challenge join — gates push permission timing. */
  HAS_JOINED_CHALLENGE: 'griit_has_joined_challenge',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Shared identity caps for profiles.update — match the edit-profile client.
 * Username 20 (README + edit + account name). Bio 150. Display name 30.
 */
import * as z from "zod";

export const PROFILE_USERNAME_MAX = 20;
export const PROFILE_DISPLAY_NAME_MAX = 30;
export const PROFILE_BIO_MAX = 150;

export const VISIBILITY_LEVELS = ["public", "friends", "private"] as const;

export const profileUpdateInputSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(PROFILE_USERNAME_MAX)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only")
    .optional(),
  display_name: z.string().max(PROFILE_DISPLAY_NAME_MAX).optional(),
  bio: z.string().max(PROFILE_BIO_MAX).optional(),
  avatar_url: z.string().max(2000).optional(),
  cover_url: z.string().max(2000).optional(),
  onboarding_completed: z.boolean().optional(),
  onboarding_completed_at: z.string().max(64).optional(),
  primary_goal: z.string().max(128).optional(),
  daily_time_budget: z.string().max(32).optional(),
  starter_challenge_id: z.string().max(64).optional(),
  preferred_secure_time: z.string().max(16).optional(),
  onboarding_answers: z.record(z.string(), z.unknown()).optional(),
  profile_visibility: z.enum(VISIBILITY_LEVELS).optional(),
  challenge_visibility: z.enum(VISIBILITY_LEVELS).optional(),
  activity_visibility: z.enum(VISIBILITY_LEVELS).optional(),
  weekly_goal: z.union([z.literal(3), z.literal(5), z.literal(7)]).optional(),
  timezone: z.string().max(64).optional(),
  distance_unit: z.enum(["km", "mi"]).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateInputSchema>;

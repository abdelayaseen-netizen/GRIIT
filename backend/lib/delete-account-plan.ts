/**
 * Rows removed when someone deletes their account.
 * Challenges they created stay, with creator_id cleared, so other members keep the challenge.
 * Storage prefixes are removed in the same pass. Auth user deletion is last and cascades leftovers.
 */
export const DELETE_USER_ROWS: { table: string; column: string }[] = [
  { table: "feed_comments", column: "user_id" },
  { table: "feed_reactions", column: "user_id" },
  { table: "feed_shares", column: "user_id" },
  { table: "check_ins", column: "user_id" },
  { table: "day_secures", column: "user_id" },
  { table: "activity_events", column: "user_id" },
  { table: "streaks", column: "user_id" },
  { table: "freeze_grants", column: "user_id" },
  { table: "freeze_uses", column: "user_id" },
  { table: "user_achievements", column: "user_id" },
  { table: "push_tokens", column: "user_id" },
  { table: "in_app_notifications", column: "user_id" },
  { table: "challenge_reports", column: "reporter_user_id" },
  { table: "user_reports", column: "reporter_user_id" },
  { table: "user_reports", column: "reported_user_id" },
  { table: "active_challenges", column: "user_id" },
];

export const DELETE_EITHER_SIDE: { table: string; columns: [string, string] }[] = [
  { table: "user_follows", columns: ["follower_id", "following_id"] },
  { table: "blocked_users", columns: ["blocker_id", "blocked_id"] },
];

export const ANONYMIZE_CREATOR = { table: "challenges", column: "creator_id" };

export const DELETE_STORAGE_BUCKETS = ["task-proofs", "avatars"] as const;

export function deleteAccountSteps(): string[] {
  return [
    ...DELETE_USER_ROWS.map((row) => `${row.table}.${row.column}`),
    ...DELETE_EITHER_SIDE.flatMap((row) => row.columns.map((column) => `${row.table}.${column}`)),
    `${ANONYMIZE_CREATOR.table}.${ANONYMIZE_CREATOR.column}=null`,
    ...DELETE_STORAGE_BUCKETS.map((bucket) => `storage.${bucket}`),
    "profiles.user_id",
    "auth.users",
  ];
}

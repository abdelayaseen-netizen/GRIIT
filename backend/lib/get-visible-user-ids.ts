/**
 * Get the list of user IDs whose activity/stories the current user can see.
 * Returns: current user + co-participants from shared challenges.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getVisibleUserIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data: userChallenges } = await supabase
    .from('active_challenges')
    .select('challenge_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  const challengeIds = userChallenges?.map(r => r.challenge_id) ?? [];

  if (challengeIds.length === 0) return [userId];

  const { data: coParticipants } = await supabase
    .from('active_challenges')
    .select('user_id')
    .in('challenge_id', challengeIds)
    .neq('user_id', userId)
    .limit(200);

  return [userId, ...(coParticipants?.map(r => r.user_id) ?? [])];
}

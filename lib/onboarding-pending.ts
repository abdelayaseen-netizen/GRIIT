/**
 * Pending onboarding flow: when user taps Join without account we store challengeId and
 * after signup + profile we join that challenge.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_CHALLENGE_ID_KEY = "griit_pending_join_challenge_id";

export async function setPendingChallengeId(challengeId: string | null): Promise<void> {
  if (challengeId == null) await AsyncStorage.removeItem(PENDING_CHALLENGE_ID_KEY);
  else await AsyncStorage.setItem(PENDING_CHALLENGE_ID_KEY, challengeId);
}

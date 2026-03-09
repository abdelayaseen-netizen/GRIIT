/**
 * Pending onboarding flow: when user taps Join without account we store challengeId and
 * after signup + profile we join that challenge. onboarding_answers stored until profile save.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_CHALLENGE_ID_KEY = "griit_pending_join_challenge_id";
const ONBOARDING_ANSWERS_KEY = "griit_onboarding_answers";

export type OnboardingAnswers = {
  main_goal?: string;
  focus?: string;
  days_per_week?: string;
  challenge_preference?: string;
};

export async function getPendingChallengeId(): Promise<string | null> {
  return AsyncStorage.getItem(PENDING_CHALLENGE_ID_KEY);
}

export async function setPendingChallengeId(challengeId: string | null): Promise<void> {
  if (challengeId == null) await AsyncStorage.removeItem(PENDING_CHALLENGE_ID_KEY);
  else await AsyncStorage.setItem(PENDING_CHALLENGE_ID_KEY, challengeId);
}

export async function getOnboardingAnswers(): Promise<OnboardingAnswers | null> {
  const raw = await AsyncStorage.getItem(ONBOARDING_ANSWERS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingAnswers;
  } catch {
    return null;
  }
}

export async function setOnboardingAnswers(answers: OnboardingAnswers | null): Promise<void> {
  if (answers == null) await AsyncStorage.removeItem(ONBOARDING_ANSWERS_KEY);
  else await AsyncStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(answers));
}

/** Clear both after successful profile save + join. */
export async function clearOnboardingPending(): Promise<void> {
  await AsyncStorage.multiRemove([PENDING_CHALLENGE_ID_KEY, ONBOARDING_ANSWERS_KEY]);
}

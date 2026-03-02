import AsyncStorage from "@react-native-async-storage/async-storage";

const JOINED_CHALLENGES_KEY = "joined_starter_challenges";
export const DAY1_STARTED_AT_KEY = "day1_quick_win_started_at";

export async function getJoinedStarterIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(JOINED_CHALLENGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveJoinedStarterId(id: string): Promise<void> {
  try {
    const ids = await getJoinedStarterIds();
    if (!ids.includes(id)) {
      ids.push(id);
      await AsyncStorage.setItem(JOINED_CHALLENGES_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    // Save failed — non-critical
    throw e;
  }
}

export async function setDay1StartedAt(): Promise<void> {
  try {
    await AsyncStorage.setItem(DAY1_STARTED_AT_KEY, String(Date.now()));
  } catch {
    // non-critical
  }
}

export async function getDay1TtfvSeconds(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(DAY1_STARTED_AT_KEY);
    if (!raw) return null;
    const started = parseInt(raw, 10);
    if (Number.isNaN(started)) return null;
    return Math.round((Date.now() - started) / 1000);
  } catch {
    return null;
  }
}

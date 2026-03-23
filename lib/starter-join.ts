import AsyncStorage from "@react-native-async-storage/async-storage";

const JOINED_CHALLENGES_KEY = "joined_starter_challenges";
export const DAY1_STARTED_AT_KEY = "day1_quick_win_started_at";
export const FIRST_SESSION_JUST_FINISHED_KEY = "griit_first_session_just_finished";

export async function getFirstSessionJustFinished(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(FIRST_SESSION_JUST_FINISHED_KEY);
    return v === "1";
  } catch (error) {
    console.error("[starter-join:getFirstSessionJustFinished] failed:", error);
    return false;
  }
}

export async function setFirstSessionJustFinished(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_SESSION_JUST_FINISHED_KEY, "1");
  } catch (error) {
    console.error("[starter-join:setFirstSessionJustFinished] failed:", error);
  }
}

export async function clearFirstSessionJustFinished(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FIRST_SESSION_JUST_FINISHED_KEY);
  } catch (error) {
    console.error("[starter-join:clearFirstSessionJustFinished] failed:", error);
  }
}

export async function getJoinedStarterIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(JOINED_CHALLENGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("[starter-join:getJoinedStarterIds] failed:", error);
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
  } catch (error) {
    console.error("[starter-join:setDay1StartedAt] failed:", error);
  }
}

export async function getDay1TtfvSeconds(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(DAY1_STARTED_AT_KEY);
    if (!raw) return null;
    const started = parseInt(raw, 10);
    if (Number.isNaN(started)) return null;
    return Math.round((Date.now() - started) / 1000);
  } catch (error) {
    console.error("[starter-join:getDay1TtfvSeconds] failed:", error);
    return null;
  }
}

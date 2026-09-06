import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalTimerSession = {
  kind: "timer" | "workout_session";
  startedAtIso: string;
  requiredSeconds: number;
  activeChallengeId: string;
  taskId: string;
  dateKey: string;
  soundOn: boolean;
};

function key(userId: string, taskId: string, dateKey: string): string {
  return `griit_timer_session_${userId}_${taskId}_${dateKey}`;
}

export async function saveLocalTimerSession(
  userId: string,
  session: LocalTimerSession
): Promise<void> {
  await AsyncStorage.setItem(key(userId, session.taskId, session.dateKey), JSON.stringify(session));
}

export async function loadLocalTimerSession(
  userId: string,
  taskId: string,
  dateKey: string
): Promise<LocalTimerSession | null> {
  const raw = await AsyncStorage.getItem(key(userId, taskId, dateKey));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocalTimerSession;
    if (!parsed?.startedAtIso || !parsed.requiredSeconds) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearLocalTimerSession(
  userId: string,
  taskId: string,
  dateKey: string
): Promise<void> {
  await AsyncStorage.removeItem(key(userId, taskId, dateKey));
}

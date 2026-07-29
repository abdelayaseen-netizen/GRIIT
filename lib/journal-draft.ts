/**
 * Local journal draft persistence (task-states-v2 Write).
 * No prior draft path existed — AsyncStorage only, keyed per challenge/task/day.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export function journalDraftStorageKey(opts: {
  activeChallengeId: string;
  taskId: string;
  dateKey: string;
}): string {
  return `griit_journal_draft:${opts.activeChallengeId}:${opts.taskId}:${opts.dateKey}`;
}

/** Local YYYY-MM-DD for draft scoping (device calendar day). */
export function journalDraftDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function loadJournalDraft(key: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return raw;
  } catch {
    return null;
  }
}

export async function saveJournalDraft(key: string, text: string): Promise<void> {
  try {
    if (!text) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await AsyncStorage.setItem(key, text);
  } catch {
    /* non-fatal */
  }
}

export async function clearJournalDraft(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* non-fatal */
  }
}

/**
 * Local journal draft persistence (task-states-v2 Write).
 * Date key uses resolveCheckInTimeZone (schedule_timezone → profile → UTC) —
 * same resolver as checkins.complete / saveProgress.
 * Orphaned yesterday keys are left in AsyncStorage — no GC; they linger until
 * overwritten on a future same-day write or cleared after successful submit.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTodayDateKey,
  resolveCheckInTimeZone,
} from "@/lib/date-utils";

export function journalDraftStorageKey(opts: {
  activeChallengeId: string;
  taskId: string;
  dateKey: string;
}): string {
  return `griit_journal_draft:${opts.activeChallengeId}:${opts.taskId}:${opts.dateKey}`;
}

/**
 * Calendar day for draft scoping — shared check-in TZ resolver.
 */
export function journalDraftDateKey(
  scheduleTimezone?: string | null,
  profileTimezone?: string | null
): string {
  return getTodayDateKey(
    resolveCheckInTimeZone(scheduleTimezone, profileTimezone)
  );
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

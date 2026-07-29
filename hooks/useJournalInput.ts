import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  clearJournalDraft,
  journalDraftDateKey,
  journalDraftStorageKey,
  loadJournalDraft,
  saveJournalDraft,
} from "@/lib/journal-draft";

interface UseJournalInputOptions {
  minWords: number;
  onError: (msg: string) => void;
  /** When set, drafts autosave to AsyncStorage under challenge/task/day. */
  draftScope?: {
    activeChallengeId: string;
    taskId: string;
    /** Task schedule_timezone — preferred by resolveCheckInTimeZone. */
    scheduleTimezone?: string | null;
    /** Profile timezone — fallback when schedule unset (same as complete). */
    profileTimezone?: string | null;
  } | null;
}

interface UseJournalInputReturn {
  journalText: string;
  handleJournalChange: (text: string) => void;
  wordCount: number;
  journalOk: boolean;
  /** True after initial draft hydrate finishes (or immediately when no scope). */
  draftReady: boolean;
  /** Clear persisted draft after successful submit. */
  clearDraft: () => Promise<void>;
}

const AUTOSAVE_MS = 400;

export function useJournalInput({
  minWords,
  onError,
  draftScope = null,
}: UseJournalInputOptions): UseJournalInputReturn {
  const [journalText, setJournalText] = useState("");
  const [draftReady, setDraftReady] = useState(!draftScope);
  const lastLenRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = useMemo(() => {
    if (!draftScope?.activeChallengeId || !draftScope.taskId) return null;
    return journalDraftStorageKey({
      activeChallengeId: draftScope.activeChallengeId,
      taskId: draftScope.taskId,
      dateKey: journalDraftDateKey(
        draftScope.scheduleTimezone,
        draftScope.profileTimezone
      ),
    });
  }, [
    draftScope?.activeChallengeId,
    draftScope?.taskId,
    draftScope?.scheduleTimezone,
    draftScope?.profileTimezone,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (!draftKey) {
      setDraftReady(true);
      return;
    }
    setDraftReady(false);
    void loadJournalDraft(draftKey).then((text) => {
      if (cancelled) return;
      if (typeof text === "string" && text.length > 0) {
        lastLenRef.current = text.length;
        setJournalText(text);
      }
      setDraftReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !draftReady) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveJournalDraft(draftKey, journalText);
    }, AUTOSAVE_MS);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draftKey, draftReady, journalText]);

  const handleJournalChange = useCallback(
    (text: string) => {
      if (text.length - lastLenRef.current > 5 && lastLenRef.current > 0) {
        onError("Write your own thoughts — pasting is not allowed.");
        return;
      }
      lastLenRef.current = text.length;
      setJournalText(text);
    },
    [onError]
  );

  const clearDraft = useCallback(async () => {
    if (draftKey) await clearJournalDraft(draftKey);
  }, [draftKey]);

  const wordCount = useMemo(
    () => journalText.trim().split(/\s+/).filter(Boolean).length,
    [journalText]
  );
  const journalOk = minWords === 0 || wordCount >= minWords;

  return {
    journalText,
    handleJournalChange,
    wordCount,
    journalOk,
    draftReady,
    clearDraft,
  };
}

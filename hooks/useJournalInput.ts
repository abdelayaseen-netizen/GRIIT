import { useState, useCallback, useMemo, useRef } from "react";

interface UseJournalInputOptions {
  minWords: number;
  onError: (msg: string) => void;
}

interface UseJournalInputReturn {
  journalText: string;
  handleJournalChange: (text: string) => void;
  wordCount: number;
  journalOk: boolean;
}

export function useJournalInput({ minWords, onError }: UseJournalInputOptions): UseJournalInputReturn {
  const [journalText, setJournalText] = useState("");
  const lastLenRef = useRef(0);

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

  const wordCount = useMemo(() => journalText.trim().split(/\s+/).filter(Boolean).length, [journalText]);
  const journalOk = minWords === 0 || wordCount >= minWords;

  return { journalText, handleJournalChange, wordCount, journalOk };
}

import { useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayDateKey } from "@/lib/date-utils";

const CELEBRATION_STORAGE_KEY = "@celebrations_shown";

interface UseCelebrationReturn {
  showCelebration: boolean;
  triggerCelebration: (taskId: string) => Promise<void>;
  onCelebrationComplete: () => void;
}

export function useCelebration(): UseCelebrationReturn {
  const [showCelebration, setShowCelebration] = useState(false);
  const currentTaskIdRef = useRef<string | null>(null);

  const hasShownCelebration = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(CELEBRATION_STORAGE_KEY);
      if (!stored) return false;
      
      const shownIds: Record<string, string> = JSON.parse(stored);
      const today = getTodayDateKey();
      const key = `${taskId}_${today}`;
      
      return !!shownIds[key];
    } catch {
      return false;
    }
  }, []);

  const markCelebrationShown = useCallback(async (taskId: string): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(CELEBRATION_STORAGE_KEY);
      const shownIds: Record<string, string> = stored ? JSON.parse(stored) : {};
      
      const today = getTodayDateKey();
      const key = `${taskId}_${today}`;
      shownIds[key] = new Date().toISOString();
      
      const keys = Object.keys(shownIds);
      if (keys.length > 100) {
        const sortedKeys = keys.sort((a, b) => {
          return new Date(shownIds[a] ?? 0).getTime() - new Date(shownIds[b] ?? 0).getTime();
        });
        const keysToRemove = sortedKeys.slice(0, keys.length - 50);
        keysToRemove.forEach((k) => delete shownIds[k]);
      }
      
      await AsyncStorage.setItem(CELEBRATION_STORAGE_KEY, JSON.stringify(shownIds));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const triggerCelebration = useCallback(async (taskId: string): Promise<void> => {
    if (currentTaskIdRef.current === taskId) return;
    const alreadyShown = await hasShownCelebration(taskId);
    if (alreadyShown) return;
    currentTaskIdRef.current = taskId;
    await markCelebrationShown(taskId);
    setShowCelebration(true);
  }, [hasShownCelebration, markCelebrationShown]);

  const onCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    currentTaskIdRef.current = null;
  }, []);

  return {
    showCelebration,
    triggerCelebration,
    onCelebrationComplete,
  };
}

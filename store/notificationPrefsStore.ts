import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationPrefs = {
  lockScreenTimer: boolean;
  showActiveTaskCard: boolean;
};

const NOTIFICATION_PREFS_STORAGE_KEY = "griit:notification-prefs:v1";

export type NotificationPrefsState = NotificationPrefs & {
  setLockScreenTimer: (v: boolean) => void;
  setShowActiveTaskCard: (v: boolean) => void;
};

const initialPrefs: NotificationPrefs = {
  lockScreenTimer: true,
  showActiveTaskCard: true,
};

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      ...initialPrefs,
      setLockScreenTimer: (v) => set({ lockScreenTimer: v }),
      setShowActiveTaskCard: (v) => set({ showActiveTaskCard: v }),
    }),
    {
      name: NOTIFICATION_PREFS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lockScreenTimer: state.lockScreenTimer,
        showActiveTaskCard: state.showActiveTaskCard,
      }),
    }
  )
);

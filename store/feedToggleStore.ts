/**
 * Persisted Friends/Everyone toggle for the home feed.
 *
 * Matches the spec's `useFeedToggle` shape but lives under `store/` to match
 * the rest of the GRIIT zustand stores (notificationPrefs, onboarding, etc.).
 * Default scope is "everyone" — a one-shot init helper flips to "following"
 * the first time the user has at least one follow.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeedScope = 'following' | 'everyone';

const FEED_TOGGLE_STORAGE_KEY = 'griit:feed-toggle:v1';

export type FeedToggleState = {
  scope: FeedScope;
  hasInitialized: boolean;
  setScope: (scope: FeedScope) => void;
  /** One-shot: pick a sensible default the first time we know the follow count. */
  initIfFirstRun: (followCount: number) => void;
};

export const useFeedToggle = create<FeedToggleState>()(
  persist(
    (set, get) => ({
      scope: 'everyone',
      hasInitialized: false,
      setScope: (scope) => set({ scope }),
      initIfFirstRun: (followCount) => {
        if (get().hasInitialized) return;
        set({
          hasInitialized: true,
          scope: followCount >= 1 ? 'following' : 'everyone',
        });
      },
    }),
    {
      name: FEED_TOGGLE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        scope: state.scope,
        hasInitialized: state.hasInitialized,
      }),
    },
  ),
);

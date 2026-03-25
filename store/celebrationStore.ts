import { create } from "zustand";

export type CelebrationType = "goal" | "streak" | "badge";

type CelebrationState = {
  visible: boolean;
  title: string;
  subtitle: string;
  type: CelebrationType;
  /** When set, success modal shows Share as primary CTA. */
  shareMessage?: string | null;
  show: (p: { title: string; subtitle: string; type: CelebrationType; shareMessage?: string }) => void;
  dismiss: () => void;
};

export const useCelebrationStore = create<CelebrationState>((set) => ({
  visible: false,
  title: "",
  subtitle: "",
  type: "goal",
  shareMessage: null,
  show: (p) => set({ visible: true, ...p, shareMessage: p.shareMessage ?? null }),
  dismiss: () => set({ visible: false, shareMessage: null }),
}));

export function showGoalCelebration(pointsEarned = 5) {
  useCelebrationStore.getState().show({
    title: "Goal secured!",
    subtitle: `+${pointsEarned} points`,
    type: "goal",
  });
}

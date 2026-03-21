import { create } from "zustand";

export type CelebrationType = "goal" | "streak" | "badge";

type CelebrationState = {
  visible: boolean;
  title: string;
  subtitle: string;
  type: CelebrationType;
  show: (p: { title: string; subtitle: string; type: CelebrationType }) => void;
  dismiss: () => void;
};

export const useCelebrationStore = create<CelebrationState>((set) => ({
  visible: false,
  title: "",
  subtitle: "",
  type: "goal",
  show: (p) => set({ visible: true, ...p }),
  dismiss: () => set({ visible: false }),
}));

export function showGoalCelebration(pointsEarned = 5) {
  useCelebrationStore.getState().show({
    title: "Goal secured!",
    subtitle: `+${pointsEarned} points`,
    type: "goal",
  });
}

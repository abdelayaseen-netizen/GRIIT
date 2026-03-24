import { create } from "zustand";

export type ProofSharePayload = {
  userName: string;
  challengeTitle: string;
  dayNumber: number;
  totalDays: number;
  streakCount: number;
  proofPhotoUri?: string;
};

type State = {
  payload: ProofSharePayload | null;
  show: (p: ProofSharePayload) => void;
  dismiss: () => void;
};

export const useProofSharePromptStore = create<State>((set) => ({
  payload: null,
  show: (p) => set({ payload: p }),
  dismiss: () => set({ payload: null }),
}));

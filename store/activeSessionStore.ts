import { create } from "zustand";

export type ActiveSession = {
  taskId: string;
  taskName: string;
  taskType: string;
  activeChallengeId: string;
  challengeName: string;
  startedAtMs: number;
  targetSeconds?: number;
  isTimerRunning: boolean;
};

type ActiveSessionState = {
  activeSession: ActiveSession | null;
  setActiveSession: (session: ActiveSession) => void;
  updateTimerRunning: (running: boolean) => void;
  clearActiveSession: () => void;
};

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  updateTimerRunning: (running) =>
    set((s) =>
      s.activeSession ? { activeSession: { ...s.activeSession, isTimerRunning: running } } : s
    ),
  clearActiveSession: () => set({ activeSession: null }),
}));

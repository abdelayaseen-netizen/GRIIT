import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingIntensity = "foundation" | "push" | "maximum" | null;

export type OnboardingGoal =
  | 'physical_toughness'
  | 'mental_discipline'
  | 'daily_habits'
  | 'reading_learning'
  | 'cold_exposure'
  | 'no_excuses';

export type IntensityLevel = 'beginner' | 'intermediate' | 'extreme';

const ONBOARDING_STORAGE_KEY = "griit-onboarding";

const ONBOARDING_STEP_ROUTES: Record<number, string> = {
  1: "/onboarding",
  2: "/onboarding/identity",
  3: "/onboarding/barrier",
  4: "/onboarding/intensity",
  5: "/onboarding/social",
  6: "/onboarding/proof",
  7: "/onboarding/challenge",
  8: "/auth/signup",
  9: "/onboarding/first-task",
};

export function getOnboardingRouteForStep(step: number): string {
  return ONBOARDING_STEP_ROUTES[step] ?? "/onboarding";
}

export interface OnboardingState {
  motivation: string | null;
  persona: string | null;
  barrier: string | null;
  barriers: string[];
  intensity: OnboardingIntensity;
  socialStyle: string | null;
  trainingTime: string | null;
  selectedChallengeId: string | null;
  username: string | null;
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  hasCompletedOnboarding: boolean;
  selectedGoals: OnboardingGoal[];
  intensityLevel: IntensityLevel | null;
  setMotivation: (v: string) => void;
  setPersona: (v: string) => void;
  setBarrier: (v: string) => void;
  setBarriers: (v: string[]) => void;
  toggleBarrier: (id: string) => void;
  setIntensity: (v: OnboardingIntensity) => void;
  setSocialStyle: (v: string) => void;
  setTrainingTime: (v: string) => void;
  setSelectedChallenge: (v: string | null) => void;
  setUsername: (v: string | null) => void;
  completeOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleGoal: (goal: OnboardingGoal) => void;
  setIntensityLevel: (level: IntensityLevel) => void;
  reset: () => void;
}

const initialState = {
  motivation: null as string | null,
  persona: null as string | null,
  barrier: null as string | null,
  barriers: [] as string[],
  intensity: null as OnboardingIntensity,
  socialStyle: null as string | null,
  trainingTime: null as string | null,
  selectedChallengeId: null as string | null,
  username: null as string | null,
  isComplete: false,
  currentStep: 0,
  totalSteps: 4,
  hasCompletedOnboarding: false,
  selectedGoals: [] as OnboardingGoal[],
  intensityLevel: null as IntensityLevel | null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setMotivation: (v) => set({ motivation: v }),
      setPersona: (v) => set({ persona: v }),
      setBarrier: (v) => set({ barrier: v }),
      setBarriers: (v) => set({ barriers: v }),
      toggleBarrier: (id) => set((s) => {
        const next = s.barriers.includes(id) ? s.barriers.filter((b) => b !== id) : [...s.barriers, id];
        return { barriers: next, barrier: next[0] ?? null };
      }),
      setIntensity: (v) => set({ intensity: v }),
      setSocialStyle: (v) => set({ socialStyle: v }),
      setTrainingTime: (v) => set({ trainingTime: v }),
      setSelectedChallenge: (v) => set({ selectedChallengeId: v }),
      setUsername: (v) => set({ username: v }),
      completeOnboarding: () => set({ isComplete: true, hasCompletedOnboarding: true }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      toggleGoal: (goal) => set((s) => {
        const exists = s.selectedGoals.includes(goal);
        if (exists) {
          return { selectedGoals: s.selectedGoals.filter((g) => g !== goal) };
        }
        if (s.selectedGoals.length >= 3) return s;
        return { selectedGoals: [...s.selectedGoals, goal] };
      }),
      setIntensityLevel: (level) => set({ intensityLevel: level }),
      reset: () => set(initialState),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        motivation: state.motivation,
        persona: state.persona,
        barrier: state.barrier,
        barriers: state.barriers,
        intensity: state.intensity,
        socialStyle: state.socialStyle,
        trainingTime: state.trainingTime,
        selectedChallengeId: state.selectedChallengeId,
        username: state.username,
        isComplete: state.isComplete,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        selectedGoals: state.selectedGoals,
        intensityLevel: state.intensityLevel,
      }),
    }
  )
);

export async function clearOnboardingStorage(): Promise<void> {
  useOnboardingStore.getState().reset();
  const storage = await import("@react-native-async-storage/async-storage");
  await storage.default.removeItem(ONBOARDING_STORAGE_KEY);
}

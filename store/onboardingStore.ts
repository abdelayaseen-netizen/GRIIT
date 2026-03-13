import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingIntensity = "foundation" | "push" | "maximum" | null;

const ONBOARDING_STORAGE_KEY = "griit-onboarding";

const ONBOARDING_STEP_ROUTES: Record<number, string> = {
  1: "/onboarding",
  2: "/onboarding/identity",
  3: "/onboarding/barrier",
  4: "/onboarding/intensity",
  5: "/onboarding/social",
  6: "/onboarding/proof",
  7: "/onboarding/challenge",
  8: "/onboarding/signup",
  9: "/onboarding/first-task",
};

export function getOnboardingRouteForStep(step: number): string {
  return ONBOARDING_STEP_ROUTES[step] ?? "/onboarding";
}

export interface OnboardingState {
  motivation: string | null;
  persona: string | null;
  barrier: string | null;
  intensity: OnboardingIntensity;
  socialStyle: string | null;
  trainingTime: string | null;
  selectedChallengeId: string | null;
  isComplete: boolean;
  currentStep: number;
  setMotivation: (v: string) => void;
  setPersona: (v: string) => void;
  setBarrier: (v: string) => void;
  setIntensity: (v: OnboardingIntensity) => void;
  setSocialStyle: (v: string) => void;
  setTrainingTime: (v: string) => void;
  setSelectedChallenge: (v: string | null) => void;
  completeOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  motivation: null as string | null,
  persona: null as string | null,
  barrier: null as string | null,
  intensity: null as OnboardingIntensity,
  socialStyle: null as string | null,
  trainingTime: null as string | null,
  selectedChallengeId: null as string | null,
  isComplete: false,
  currentStep: 1,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setMotivation: (v) => set({ motivation: v }),
      setPersona: (v) => set({ persona: v }),
      setBarrier: (v) => set({ barrier: v }),
      setIntensity: (v) => set({ intensity: v }),
      setSocialStyle: (v) => set({ socialStyle: v }),
      setTrainingTime: (v) => set({ trainingTime: v }),
      setSelectedChallenge: (v) => set({ selectedChallengeId: v }),
      completeOnboarding: () => set({ isComplete: true }),
      setCurrentStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        motivation: state.motivation,
        persona: state.persona,
        barrier: state.barrier,
        intensity: state.intensity,
        socialStyle: state.socialStyle,
        trainingTime: state.trainingTime,
        selectedChallengeId: state.selectedChallengeId,
        isComplete: state.isComplete,
        currentStep: state.currentStep,
      }),
    }
  )
);

export async function clearOnboardingStorage(): Promise<void> {
  useOnboardingStore.getState().reset();
  const storage = await import("@react-native-async-storage/async-storage");
  await storage.default.removeItem(ONBOARDING_STORAGE_KEY);
}

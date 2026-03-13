import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingIntensity = "foundation" | "push" | "maximum" | null;

export interface OnboardingState {
  motivation: string | null;
  persona: string | null;
  barrier: string | null;
  intensity: OnboardingIntensity;
  socialStyle: string | null;
  trainingTime: string | null;
  selectedChallengeId: string | null;
  isComplete: boolean;
  setMotivation: (v: string) => void;
  setPersona: (v: string) => void;
  setBarrier: (v: string) => void;
  setIntensity: (v: OnboardingIntensity) => void;
  setSocialStyle: (v: string) => void;
  setTrainingTime: (v: string) => void;
  setSelectedChallenge: (v: string | null) => void;
  completeOnboarding: () => void;
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
      reset: () => set(initialState),
    }),
    {
      name: "griit-onboarding",
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
      }),
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnboardingV2Step } from "@/lib/onboarding-v2-routing";

export type OnboardingIntensity = "foundation" | "push" | "maximum" | null;

export type OnboardingGoal =
  | 'physical_toughness'
  | 'mental_discipline'
  | 'daily_habits'
  | 'reading_learning'
  | 'cold_exposure';

export type IntensityLevel = 'beginner' | 'intermediate' | 'extreme';

/**
 * OnboardingFlowV2 commitment mode (screen 05). Added (not reused from
 * `intensityLevel`) because `intensityLevel` encodes a 3-level
 * beginner/intermediate/extreme scale, not the binary Standard/Hard the
 * commitment screen needs.
 */
export type OnboardingCommitment = 'standard' | 'hard' | null;

const ONBOARDING_STORAGE_KEY = "griit-onboarding";

export type ProfileSetupHints = {
  email?: string;
  displayNameFromApple?: string;
};

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
  /** OnboardingFlowV2 (screen 05) — Standard vs Hard mode. */
  commitment: OnboardingCommitment;
  /** OnboardingFlowV2 (screen 06) — whether the reminders primer has been shown/answered. */
  notificationsAsked: boolean;
  /** OnboardingFlowV2 step key. Separate from old-flow `currentStep`. */
  v2Step: OnboardingV2Step;
  /** Ephemeral hints for ProfileSetup (email prefix, Apple full name); not persisted. */
  profileSetupHints: ProfileSetupHints | null;
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
  setSelectedGoals: (goals: OnboardingGoal[]) => void;
  setIntensityLevel: (level: IntensityLevel) => void;
  setCommitment: (commitment: OnboardingCommitment) => void;
  setNotificationsAsked: (asked: boolean) => void;
  setV2Step: (step: OnboardingV2Step) => void;
  setProfileSetupHints: (hints: ProfileSetupHints | null) => void;
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
  totalSteps: 5,
  hasCompletedOnboarding: false,
  selectedGoals: [] as OnboardingGoal[],
  intensityLevel: null as IntensityLevel | null,
  commitment: null as OnboardingCommitment,
  notificationsAsked: false,
  v2Step: "welcome" as OnboardingV2Step,
  profileSetupHints: null as ProfileSetupHints | null,
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
      setSelectedGoals: (goals) => set({ selectedGoals: goals.slice(0, 3) }),
      setIntensityLevel: (level) => set({ intensityLevel: level }),
      setCommitment: (commitment) => set({ commitment }),
      setNotificationsAsked: (asked) => set({ notificationsAsked: asked }),
      setV2Step: (step) => set({ v2Step: step }),
      setProfileSetupHints: (hints) => set({ profileSetupHints: hints }),
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
        commitment: state.commitment,
        notificationsAsked: state.notificationsAsked,
        v2Step: state.v2Step,
        // profileSetupHints intentionally omitted from persist
      }),
    }
  )
);

export async function clearOnboardingStorage(): Promise<void> {
  useOnboardingStore.getState().reset();
  const storage = await import("@react-native-async-storage/async-storage");
  await storage.default.removeItem(ONBOARDING_STORAGE_KEY);
}

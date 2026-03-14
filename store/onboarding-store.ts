import { create } from 'zustand';

export type OnboardingGoal =
  | 'physical_toughness'
  | 'mental_discipline'
  | 'daily_habits'
  | 'reading_learning'
  | 'cold_exposure'
  | 'no_excuses';

export type IntensityLevel = 'beginner' | 'intermediate' | 'extreme';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  hasCompletedOnboarding: boolean;
  selectedGoals: OnboardingGoal[];
  intensityLevel: IntensityLevel | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleGoal: (goal: OnboardingGoal) => void;
  setIntensity: (level: IntensityLevel) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 0,
  totalSteps: 9,
  hasCompletedOnboarding: false,
  selectedGoals: [],
  intensityLevel: null,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1) })),
  prevStep: () =>
    set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

  toggleGoal: (goal) =>
    set((s) => {
      const exists = s.selectedGoals.includes(goal);
      if (exists) {
        return { selectedGoals: s.selectedGoals.filter((g) => g !== goal) };
      }
      if (s.selectedGoals.length >= 3) return s;
      return { selectedGoals: [...s.selectedGoals, goal] };
    }),

  setIntensity: (level) => set({ intensityLevel: level }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  reset: () =>
    set({
      currentStep: 0,
      selectedGoals: [],
      intensityLevel: null,
      hasCompletedOnboarding: false,
    }),
}));

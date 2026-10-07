import React from 'react';
import { color, space } from '../../tokens';
import { OnboardingScreen, OptionRow, PrimaryButton } from './OnboardingChrome';

// The six goals as they exist in the app. Persisted to the profile, and the input
// to FirstChallenge: this screen is the only reason that screen can be filtered.
export const GOALS = [
  { id: 'physical_toughness', label: 'Physical toughness', example: 'Lifting, running, no missed sessions' },
  { id: 'mental_discipline', label: 'Mental discipline', example: 'Meditation, journaling, focus blocks' },
  { id: 'daily_habits', label: 'Daily habits', example: 'Wake times, water, tidy space' },
  { id: 'reading_learning', label: 'Reading and learning', example: 'Pages a day, a course, a language' },
  { id: 'cold_exposure', label: 'Cold exposure', example: 'Cold showers, plunges, breathwork' },
  { id: 'sleep_recovery', label: 'Sleep and recovery', example: 'Phone down, lights out, rest days' },
] as const;

export const MAX_GOALS = 3;

export function Goals({ selected, onToggle, onBack, onContinue }: {
  selected: string[]; onToggle?: (id: string) => void; onBack?: () => void; onContinue?: () => void;
}) {
  const blocked = selected.length === 0;
  return (
    <OnboardingScreen
      step={0}
      onBack={onBack}
      title="What are you building?"
      subtitle={`Pick 1 to ${MAX_GOALS}. It filters the challenges we suggest.`}
      footer={<PrimaryButton label={blocked ? 'Pick at least one' : 'Continue'} disabled={blocked} onPress={onContinue} />}
    >
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {GOALS.map(g => {
          const on = selected.includes(g.id);
          // At the cap, unselected rows stop responding rather than silently dropping a pick.
          const atCap = !on && selected.length >= MAX_GOALS;
          return (
            <div key={g.id} style={{ opacity: atCap ? 0.5 : 1 }}>
              <OptionRow title={g.label} subtitle={g.example} selected={on} onPress={atCap ? undefined : () => onToggle?.(g.id)} />
            </div>
          );
        })}
      </div>
    </OnboardingScreen>
  );
}

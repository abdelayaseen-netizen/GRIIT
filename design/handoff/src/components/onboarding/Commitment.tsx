import React from 'react';
import { color, type, space } from '../../tokens';
import { OnboardingScreen, OptionRow, PrimaryButton } from './OnboardingChrome';

// Day target, stored as the target streak. Standard vs Hard is not here: that is a
// per-challenge setting owned by the creator, shown on the challenge screen.
export const DAY_TARGETS = [
  { days: 7, line: 'Enough to find out whether the tasks fit your day.' },
  { days: 30, line: 'Long enough that a bad week lands inside it.' },
  { days: 75, line: 'Two and a half months with no gap.' },
] as const;

export function Commitment({ target, onPick, onBack, onLockIn }: {
  target: number | 'custom'; onPick?: (t: number | 'custom') => void; onBack?: () => void; onLockIn?: () => void;
}) {
  const shown = typeof target === 'number' ? target : 30;
  return (
    <OnboardingScreen
      step={3}
      onBack={onBack}
      title="Set your line."
      subtitle="How many days are you committing to. You can change it later, but you have to change it on purpose."
      footer={<PrimaryButton label="Lock it in" onPress={onLockIn} />}
    >
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {DAY_TARGETS.map(t => (
          <OptionRow key={t.days} title={`${t.days} days`} subtitle={t.line} selected={target === t.days} onPress={() => onPick?.(t.days)} />
        ))}
        <OptionRow title="Custom" subtitle="Any number from 3 to 365." selected={target === 'custom'} onPress={() => onPick?.('custom')} />
      </div>
      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
        Home counts against this: Day 1 of {shown}.
      </div>
    </OnboardingScreen>
  );
}

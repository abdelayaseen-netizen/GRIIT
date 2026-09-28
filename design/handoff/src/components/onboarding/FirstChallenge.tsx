import React from 'react';
import { color, type, space, radius, border } from '../../tokens';
import { OnboardingScreen, PrimaryButton, TextLink, Icon, gateLabel, type Gate } from './OnboardingChrome';

export type Suggestion = {
  id: string;
  title: string;
  duration_days: number;
  participation: 'Solo' | 'Duo' | 'Team';
  is_hard_mode: boolean;
  tasks: { name: string; gates: Gate[]; timeWindow?: string }[];
};

// Three suggestions filtered by the goals from screen 2. When the filter returns
// nothing we say so: padding the list with unrelated challenges would make the
// goals screen a lie.
export function FirstChallenge({ suggestions, selectedId, goalLabels, onSelect, onJoin, onBrowseAll, onLater, onBack }: {
  suggestions: Suggestion[]; selectedId?: string; goalLabels: string[];
  onSelect?: (id: string) => void; onJoin?: () => void; onBrowseAll?: () => void; onLater?: () => void; onBack?: () => void;
}) {
  const empty = suggestions.length === 0;
  return (
    <OnboardingScreen
      step={4}
      onBack={onBack}
      title="Start here."
      subtitle={empty ? `Nothing in the catalogue matches ${goalLabels.join(' and ').toLowerCase()} yet.` : 'Three that match your goals.'}
      footer={empty ? (
        <>
          <PrimaryButton label="Browse all" onPress={onBrowseAll} />
          <TextLink label="Set this up later" onPress={onLater} />
        </>
      ) : (
        <>
          <PrimaryButton label="Join" disabled={!selectedId} onPress={onJoin} />
          <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>Day 1 is today.</div>
          {/* Side by side: stacked, the two links cost 48pt of footer and the third card
              falls behind it, which contradicts the subtitle. */}
          <div style={{ display: 'flex', gap: space.sm }}>
            <div style={{ flex: 1 }}><TextLink label="Browse all" onPress={onBrowseAll} /></div>
            <div style={{ flex: 1 }}><TextLink label="Set this up later" onPress={onLater} /></div>
          </div>
        </>
      )}
    >
      {empty ? (
        <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
          <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.gutter, display: 'flex', gap: space.lg, alignItems: 'flex-start' }}>
            <Icon name="search-x" tone={color.textPrimary} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <div style={{ ...type.bodyStrong, color: color.textPrimary }}>No suggestions for those goals</div>
              <div style={{ ...type.secondary, color: color.textSecondary }}>Browse the full catalogue, or start without one and join later from Discover.</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: `${space.md}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {suggestions.map(s => {
            const on = s.id === selectedId;
            return (
              <div key={s.id} role="button" onClick={() => onSelect?.(s.id)} style={{
                borderRadius: radius.card, background: on ? color.brandTint : color.surface,
                border: on ? `1.5px solid ${color.brand}` : border,
                padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: space.sm,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: space.md }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{s.title}</div>
                    <div style={{ ...type.caption, color: color.textSecondary }}>{s.duration_days} days · {s.participation}</div>
                  </div>
                  {on
                    ? <Icon name="check" size={20} tone={color.brandText} />
                    : <div style={{ width: 20, height: 20, borderRadius: radius.pill, border: `1.5px solid ${color.textSecondary}`, flex: 'none' }} />}
                </div>
                {/* One line per task, gate right-aligned. Three cards have to fit above the footer. */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
                  {s.tasks.map(t => (
                    <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md }}>
                      <div style={{ ...type.secondary, color: color.textPrimary }}>{t.name}</div>
                      <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'right' }}>{gateLabel(t.gates, t.timeWindow)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...type.caption, color: color.textSecondary }}>
                  {s.is_hard_mode ? 'Hard mode. Gates are enforced; a failed gate fails the day.' : 'Standard mode. Gates are recorded, not enforced.'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OnboardingScreen>
  );
}

import React from 'react';
import { color, type, space, radius, border } from '../../tokens';
import { OnboardingScreen, PrimaryButton, Icon, gateLabel, type Gate } from './OnboardingChrome';

type Row = { name: string; gates: Gate[]; timeWindow?: string; done: boolean };

// The single argument of the flow. It is made with the real Today card, not a mock:
// the same rows, dots and gate labels the user will see on Home tomorrow.
export function WhyProof({ rows, onBack, onSkip, onContinue }: {
  rows: Row[]; onBack?: () => void; onSkip?: () => void; onContinue?: () => void;
}) {
  const done = rows.filter(r => r.done).length;
  return (
    <OnboardingScreen
      step={1}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title="Streaks are easy to fake."
      subtitle="Everywhere else you tap a box. Here the server secures the day, and only when every task in every challenge you joined is done."
      footer={<PrimaryButton label="Continue" onPress={onContinue} />}
    >
      {/* The real Home streak block, at zero, because that is what this user has. */}
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <div style={{ ...type.secondary, color: color.textSecondary }}>Current streak</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: space.sm }}>
          {/* No display face: nothing has been earned yet. */}
          <div style={{ fontSize: 44, lineHeight: '48px', fontWeight: '500', color: color.textPrimary, fontVariantNumeric: 'tabular-nums' }}>0</div>
          <div style={{ ...type.body, color: color.textSecondary }}>days</div>
        </div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>Post today to start.</div>
      </div>

      <div style={{ padding: `${space.lg}px ${space.gutter}px 0` }}>
        <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.gutter, display: 'flex', flexDirection: 'column', gap: space.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
            <div style={{ ...type.heading, color: color.textPrimary }}>Today</div>
            <div style={{ flex: 'none', padding: '6px 12px', borderRadius: radius.input, background: color.brandTint, ...type.caption, fontWeight: '500', color: color.brandText }}>{done} / {rows.length}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
            {rows.map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: space.md, minHeight: 44 }}>
                <div style={{ width: 20, height: 20, borderRadius: radius.pill, flex: 'none', background: r.done ? color.brand : 'transparent', border: r.done ? undefined : `1.5px solid ${color.textSecondary}` }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ ...type.bodyStrong, color: r.done ? color.textSecondary : color.textPrimary }}>{r.name}</div>
                  <div style={{ ...type.caption, color: color.textSecondary }}>{gateLabel(r.gates, r.timeWindow)}</div>
                </div>
                {r.done ? null : <Icon name="chevron-right" size={20} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: `${space.md}px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
        {done} of {rows.length}. The day is not secured, and nothing you tap changes that.
      </div>
    </OnboardingScreen>
  );
}

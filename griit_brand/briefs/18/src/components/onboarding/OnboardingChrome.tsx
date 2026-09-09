import React from 'react';
import { color, type, space, radius, border, buttonHeight, hit } from '../../tokens';

// Shared chrome for onboarding screens 2 to 9. Welcome (screen 1) does not use it:
// it has no back target and no position bar.

export const STEPS = 8; // screens 2 to 9

export function Icon({ name, size = 24, tone = color.textSecondary }: { name: string; size?: number; tone?: string }) {
  return <i data-lucide={name} style={{ width: size, height: size, color: tone, flex: 'none' }} />;
}

// Primary is color.primary. There is one filled button per screen; everything else
// is a surface button or a text link.
export function PrimaryButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress?: () => void }) {
  return (
    <div role="button" onClick={disabled ? undefined : onPress} style={{
      height: buttonHeight.regular, borderRadius: radius.pill,
      background: disabled ? color.surface : color.primary,
      border: disabled ? border : undefined,
      color: disabled ? color.textSecondary : color.textPrimary,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong,
    }}>{label}</div>
  );
}

export function TextLink({ label, tone = color.textSecondary, onPress }: { label: string; tone?: string; onPress?: () => void }) {
  return (
    <div role="button" onClick={onPress} style={{ minHeight: hit, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: tone }}>{label}</div>
  );
}

// Eight segments, one per screen from Goals to Profile. No "of 9" anywhere.
export function PositionBar({ step }: { step: number }) {
  return (
    <div style={{ padding: `${space.xs}px ${space.gutter}px 0`, display: 'flex', gap: space.xs }}>
      {Array.from({ length: STEPS }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: radius.pill, background: i <= step ? color.brand : color.border }} />
      ))}
    </div>
  );
}

// The skip is labelled with what it does, or absent. There is no bare chevron-skip.
export function OnboardingScreen({ step, onBack, skipLabel, onSkip, title, subtitle, children, footer }: {
  step: number; onBack?: () => void; skipLabel?: string; onSkip?: () => void;
  title: string; subtitle?: string; children?: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      <div style={{ height: hit, padding: `0 ${space.md}px 0 ${space.sm}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="button" onClick={onBack} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-left" tone={color.textPrimary} />
        </div>
        {skipLabel
          ? <div role="button" onClick={onSkip} style={{ minHeight: hit, padding: `0 ${space.md}px`, display: 'flex', alignItems: 'center', ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.textSecondary }}>{skipLabel}</div>
          : <div style={{ width: hit }} />}
      </div>
      <PositionBar step={step} />
      <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        <div style={{ ...type.title, color: color.textPrimary }}>{title}</div>
        {subtitle ? <div style={{ ...type.secondary, color: color.textSecondary }}>{subtitle}</div> : null}
      </div>
      {children}
      {footer ? (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.lg}px ${space.gutter}px 28px`, background: color.canvas, borderTop: border, display: 'flex', flexDirection: 'column', gap: space.xs }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

// One selectable row. Used by Goals (multi) and Commitment (single).
export function OptionRow({ title, subtitle, selected, onPress }: { title: string; subtitle: string; selected?: boolean; onPress?: () => void }) {
  return (
    <div role="button" onClick={onPress} style={{
      borderRadius: radius.card, background: selected ? color.brandTint : color.surface,
      border: selected ? `1.5px solid ${color.brand}` : border,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: space.md, minHeight: hit,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{title}</div>
        <div style={{ ...type.caption, color: color.textSecondary }}>{subtitle}</div>
      </div>
      {selected ? <Icon name="check" size={20} tone={color.brandText} /> : null}
    </div>
  );
}

// The three gates the app can enforce, and nothing else. Empty is self-reported.
export type Gate = 'camera' | 'time_window' | 'location';
export function gateLabel(gates: Gate[], timeWindow?: string): string {
  if (!gates.length) return 'Self-reported';
  return gates.map(g => (g === 'camera' ? 'Camera' : g === 'location' ? 'Location' : `Time window ${timeWindow ?? ''}`.trim())).join(' · ');
}

import React from 'react';
import { color, type, radius, border, buttonHeight, hit, space, selectedBorder } from '../tokens';

type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'regular' | 'small';
  destructive?: boolean;
  submitting?: boolean;
  onPress?: () => void;
};

// One filled primary per viewport. Repeated row actions (Follow) use secondary.
export function Button({ label, variant = 'primary', size = 'regular', destructive, submitting, onPress }: ButtonProps) {
  const base: React.CSSProperties = {
    height: buttonHeight[size],
    minWidth: hit,
    borderRadius: radius.pill,
    paddingInline: size === 'small' ? 24 : 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    ...type.bodyStrong,
    opacity: submitting ? 0.6 : 1,
  };
  const skin: React.CSSProperties =
    variant === 'primary' ? { background: color.brandText, color: color.surface }
    : variant === 'secondary' ? { background: color.surface, border, color: color.textPrimary }
    : { color: destructive ? color.danger : color.brandText };
  return <div role="button" onClick={onPress} style={{ ...base, ...skin }}>{label}</div>;
}

// A card is only for content read or tapped as one unit: a proof, a cover, a settings
// group, the proof task card, the streak card. Nesting depth is two, canvas then card:
// a card never contains a card, and nothing bordered goes inside one.
export function Card({ children, tint }: { children: React.ReactNode; tint?: boolean }) {
  return (
    <div style={{ background: tint ? color.brandTint : color.surface, border, borderRadius: radius.card, padding: space.gutter }}>
      {children}
    </div>
  );
}

// Max one ink card per screen: hero streak, FAB, cover fallback.
export function InkCard({ children }: { children: React.ReactNode }) {
  return <div style={{ background: color.textPrimary, borderRadius: radius.card, padding: space.gutter, color: color.textPrimary }}>{children}</div>;
}

// Two chip roles, and they are not interchangeable.
// 'ghost'  filters and scopes on the canvas: no border, no background until selected.
//          Ghost chips belong to a content section under a heading, never directly
//          under a segmented control.
// 'form'   answers inside the Create wizard (duration, Solo or Group).
export function Chip({ label, selected, onPress, variant = 'ghost' }: {
  label: string; selected?: boolean; onPress?: () => void; variant?: 'ghost' | 'form';
}) {
  const ghost = variant === 'ghost';
  return (
    <div onClick={onPress} style={{
      minHeight: hit, padding: '12px 16px', display: 'flex', alignItems: 'center',
      borderRadius: radius.input,
      background: selected ? color.brandTint : ghost ? 'transparent' : color.surface,
      border: ghost ? undefined : selected ? selectedBorder : border,
      color: selected ? color.brandText : ghost ? color.textSecondary : color.textPrimary,
      fontSize: type.secondary.fontSize,
      lineHeight: `${type.secondary.lineHeight}px`,
      fontWeight: selected ? type.bodyStrong.fontWeight : type.secondary.fontWeight,
    }}>{label}</div>
  );
}

// One level only, one per screen, directly under the title. It switches views.
// Never stacked, and never with chips immediately beneath it.
export function SegmentedControl({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', padding: 2, background: color.border, borderRadius: radius.pill }}>
      {items.map(i => {
        const on = i === value;
        return (
          <div key={i} onClick={() => onChange(i)} style={{
            flex: 1, height: hit, borderRadius: radius.pill,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: on ? color.surface : 'transparent',
            color: on ? color.textPrimary : color.textSecondary,
            ...type.secondary, fontWeight: on ? type.bodyStrong.fontWeight : type.secondary.fontWeight,
          }}>{i}</div>
        );
      })}
    </div>
  );
}

export function ListRow({ icon, title, subtitle, trailing, onPress }: {
  icon?: React.ReactNode; title: string; subtitle?: string; trailing?: React.ReactNode; onPress?: () => void;
}) {
  return (
    <div onClick={onPress} style={{ minHeight: hit, padding: space.gutter, display: 'flex', alignItems: 'center', gap: space.lg }}>
      {icon}
      <div style={{ flex: 1 }}>
        <div style={type.bodyStrong}>{title}</div>
        {subtitle ? <div style={{ ...type.secondary, color: color.textSecondary }}>{subtitle}</div> : null}
      </div>
      {trailing}
    </div>
  );
}

export function Divider() { return <div style={{ height: 1, background: color.border }} />; }

// Create wizard only. Everywhere else a hint is a caption line under a heading.
export function HintBox({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ background: color.brandTint, borderRadius: radius.input, padding: space.lg, display: 'flex', gap: space.md }}>
      {icon}
      <div style={{ ...type.secondary, color: color.brandText }}>{children}</div>
    </div>
  );
}

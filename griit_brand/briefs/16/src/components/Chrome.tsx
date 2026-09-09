import React from 'react';
import { color, type, space, radius, hit } from '../tokens';

// Root tab screen: display title at the gutter, 8pt below the status bar area.
export function RootHeader({ title, kicker, actions }: { title: string; kicker?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md }}>
      <div>
        {kicker ? <div style={{ ...type.caption, color: color.textSecondary }}>{kicker}</div> : null}
        <div style={type.display}>{title}</div>
      </div>
      {actions ? <div style={{ display: 'flex', gap: space.sm, marginTop: 4 }}>{actions}</div> : null}
    </div>
  );
}

export function IconButton({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <div onClick={onPress} style={{ width: hit, height: hit, borderRadius: radius.pill, background: color.surface, border: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

// Pushed screen: 44pt bar, chevron left, heading 17/500 centred.
export function PushedHeader({ title, back, onBack }: { title: string; back: React.ReactNode; onBack?: () => void }) {
  return (
    <div style={{ height: hit, paddingInline: space.gutter, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div onClick={onBack} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center' }}>{back}</div>
      <div style={type.bodyStrong}>{title}</div>
      <div style={{ width: hit }} />
    </div>
  );
}

// Wizard: Cancel left, step centre, progress under it, tab bar hidden, CTA pinned.
export function WizardHeader({ step, total, onCancel }: { step: number; total: number; onCancel?: () => void }) {
  return (
    <div>
      <div style={{ height: hit, paddingInline: space.gutter, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onCancel} style={{ height: hit, display: 'flex', alignItems: 'center', ...type.bodyStrong, color: color.brandText }}>Cancel</div>
        <div style={type.bodyStrong}>{`Step ${step} of ${total}`}</div>
        <div style={{ width: 56 }} />
      </div>
      <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: space.sm }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ height: 4, borderRadius: radius.input, background: i < step ? color.brand : color.border }} />
        ))}
      </div>
    </div>
  );
}

export function WizardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.gutter}px ${space.gutter}px 32px`, background: color.canvas, borderTop: `1px solid ${color.border}` }}>
      {children}
    </div>
  );
}

// Kept exactly as it was: floating pill, centre FAB.
export function TabBar({ active, items, fab }: { active: string; items: { key: string; label: string; icon: (c: string) => React.ReactNode }[]; fab: React.ReactNode }) {
  const half = Math.ceil(items.length / 2);
  const render = (it: typeof items[number]) => {
    const on = it.key === active;
    const tint = on ? color.brandText : color.textSecondary;
    return (
      <div key={it.key} style={{ width: 60, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {it.icon(tint)}
        <span style={{ ...type.label, textTransform: 'none', letterSpacing: 0, color: tint, fontWeight: on ? '500' : '400' }}>{it.label}</span>
      </div>
    );
  };
  return (
    <div style={{ position: 'absolute', left: space.md, right: space.md, bottom: space.md, height: 64, background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.pill, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: space.sm }}>
      {items.slice(0, half).map(render)}
      <div style={{ width: 56, height: 56, borderRadius: radius.pill, background: color.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{fab}</div>
      {items.slice(half).map(render)}
    </div>
  );
}

export function WeekStrip({ days, todayIndex }: { days: { letter: string; filled: boolean }[]; todayIndex: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: space.sm }}>
        {days.map((d, i) => (
          <div key={i} style={{ ...type.caption, textAlign: 'center', color: i === todayIndex ? color.textPrimary : color.textSecondary, fontWeight: i === todayIndex ? '500' : '400' }}>{d.letter}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: space.sm }}>
        {days.map((d, i) => (
          <div key={i} style={{
            height: hit, borderRadius: radius.input,
            background: d.filled ? color.textPrimary : i === todayIndex ? color.brandTint : color.border,
            border: i === todayIndex && !d.filled ? `1.5px solid ${color.brand}` : undefined,
          }} />
        ))}
      </div>
    </div>
  );
}

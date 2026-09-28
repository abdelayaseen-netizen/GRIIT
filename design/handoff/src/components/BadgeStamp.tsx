import React from 'react';
import { color } from '../tokens';

// v37. Body face only, no condensed display font. Earned and locked differ on border style,
// fill, text colour, trailing control and supporting copy — never opacity alone.

// Badges count SECURED days, any proof type (founder decision, v37.1). Tiers climb on three
// channels at once — border weight, inner ring count, fill — so no two look alike.
export const BADGES = [
  { count: 1,  name: 'First day',    border: 1.5, rings: 0, fill: 'none'  },
  { count: 7,  name: 'One week',     border: 2,   rings: 1, fill: 'none'  },
  { count: 21, name: 'Three weeks',  border: 2.5, rings: 1, fill: 'tint'  },
  { count: 30, name: 'Thirty',       border: 3,   rings: 2, fill: 'tint'  },
  { count: 75, name: 'Seventy five', border: 3,   rings: 2, fill: 'solid' },
] as const;
type Tier = typeof BADGES[number];
const tierFor = (count: number): Tier => BADGES.find(b => b.count === count) ?? BADGES[0];

/** A badge is earned on the date of the user's {count}th secured day. Reduce over the day array. */
export function earnedOn(securedDateKeys: string[], count: number): string | null {
  return securedDateKeys.length >= count ? securedDateKeys[count - 1] : null;
}

export function BadgeStamp({ count, earned, size = 68, onPhoto }: { count: number; earned: boolean; size?: number; onPhoto?: boolean }) {
  const t = tierFor(count), solid = earned && t.fill === 'solid';
  const line = earned ? 'solid' : 'dashed';
  const bg = !earned ? 'transparent' : solid ? color.brand : t.fill === 'tint' ? color.brandWash : onPhoto ? 'rgba(15,15,15,0.45)' : 'transparent';
  const ring = earned ? (solid ? color.canvas : color.brand) : color.border;
  const inset = Math.round(size * 0.09);
  return (
    <div style={{
      position: 'relative', width: size, height: size, borderRadius: 20, flex: 'none', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: bg,
      border: `${t.border}px ${line} ${earned ? color.brand : color.border}`,
      filter: earned && onPhoto ? 'drop-shadow(0 0 1px rgba(15,15,15,0.9)) drop-shadow(0 1px 2px rgba(15,15,15,0.6)) drop-shadow(0 4px 12px rgba(15,15,15,0.25))' : undefined,
    }}>
      {Array.from({ length: t.rings }, (_, i) => (
        <div key={i} style={{ position: 'absolute', inset: inset * (i + 1), borderRadius: Math.max(6, 20 - inset * (i + 1) * 0.6), border: `1px ${line} ${ring}`, opacity: earned ? (i === 0 ? 0.9 : 0.6) : 1 }} />
      ))}
      <div style={{ position: 'relative', fontSize: Math.round(size * 0.34), lineHeight: `${Math.round(size * 0.36)}px`, fontWeight: '500', color: solid ? color.canvas : earned ? color.textPrimary : color.textSecondary, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
      <div style={{ position: 'relative', fontSize: Math.max(9, Math.round(size * 0.1)), fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', color: solid ? color.canvas : earned ? color.brandText : color.textSecondary }}>{count === 1 ? 'day' : 'days'}</div>
    </div>
  );
}

export function BadgeRow({ count, name, securedTotal, earnedLabel, cameraAtEarn, onShare }: { count: number; name: string; securedTotal: number; earnedLabel: string | null; cameraAtEarn?: number; onShare?: () => void }) {
  const earned = earnedLabel != null;
  return (
    <div onClick={earned ? onShare : undefined}
      accessibilityLabel={earned ? `${name}, earned ${earnedLabel}. Share.` : `${name}, locked. ${securedTotal} of ${count} secured days.`}
      style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 76, padding: '6px 0' }}>
      <BadgeStamp count={count} earned={earned} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 15, lineHeight: '20px', fontWeight: '500', color: earned ? color.textPrimary : color.textSecondary }}>{name}</div>
        <div style={{ fontSize: 12, lineHeight: '16px', color: color.textSecondary }}>{earned ? `Earned ${earnedLabel} · ${cameraAtEarn ?? 0} by camera` : `${securedTotal} of ${count} secured days`}</div>
        {earned ? null : (
          <div style={{ height: 4, borderRadius: 2, background: color.border, overflow: 'hidden', marginTop: 4, maxWidth: 180 }}>
            <div style={{ width: `${Math.min(100, Math.round((securedTotal / count) * 100))}%`, height: '100%', background: color.textSecondary }} />
          </div>
        )}
      </div>
      <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <i data-lucide={earned ? 'share' : 'lock'} style={{ width: earned ? 20 : 18, height: earned ? 20 : 18, color: earned ? color.textPrimary : color.textSecondary }} />
      </div>
    </div>
  );
}

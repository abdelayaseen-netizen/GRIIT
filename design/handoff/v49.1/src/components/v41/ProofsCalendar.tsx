import React from 'react';
import { color, type, radius, border } from '../../tokens';

// Frame 117. Replaces the Proofs tile grid. Monday first, one month per page.
// Tap a day → v39 proof viewer at that day. The day array is the only source:
// the header count is a reduction over it, never a separate server number.

export type CalDay =
  | { state: 'camera'; date: string; cover_url: string; shared: boolean }
  | { state: 'self' | 'freeze' | 'last_stand' | 'missed' | 'today' | 'future' | 'before'; date: string };

export type ProofsCalendarProps = {
  month: string;             // "2026-09"
  days: CalDay[];            // every day of the month
  viewer: 'owner' | 'visitor';
  onDay: (date: string) => void;
  onPrev?: () => void; onNext?: () => void;   // onNext undefined for the current month
};

// secured = camera + self. Freeze and Last Stand hold the streak; they are not secured.
// Days = every day from the first start_at up to yesterday, plus today only once it is secured.
export function headerLine(days: CalDay[]) {
  const secured = days.filter(d => d.state === 'camera' || d.state === 'self').length;
  const counted = days.filter(d => ['camera', 'self', 'freeze', 'last_stand', 'missed'].includes(d.state)).length;
  return `${secured} of ${counted} ${counted === 1 ? 'day' : 'days'}`;
}

export function monthTitle(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); // "September 2026"
}

// Visitor: a camera day whose photo is private renders as a plain secured cell. No lock, no photo.
function visible(d: CalDay, viewer: 'owner' | 'visitor'): CalDay {
  if (viewer === 'visitor' && d.state === 'camera' && !d.shared) return { state: 'self', date: d.date };
  return d;
}

export function DayCell({ day, viewer, onPress }: { day: CalDay; viewer: 'owner' | 'visitor'; onPress: () => void }) {
  const d = visible(day, viewer);
  const n = Number(d.date.slice(-2));
  const tappable = d.state === 'camera' || d.state === 'self';
  const base: React.CSSProperties = { position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', boxSizing: 'border-box' };
  const s: Record<string, React.CSSProperties> = {
    camera: {}, self: { background: color.brand }, freeze: { background: color.surface, border },
    last_stand: { background: color.surface, border: `1.5px solid ${color.brand}` }, missed: { border: `1px solid ${color.textSecondary}` },
    today: { border: `2px solid ${color.brand}` }, future: { border, opacity: 0.45 }, before: { border, opacity: 0.45 },
  };
  const label = { camera: 'secured, camera photo', self: 'secured, self-reported', freeze: 'held by a freeze', last_stand: 'held by a Last Stand', missed: 'missed', today: 'today, open', future: 'not yet', before: 'before you joined' }[d.state];
  return (
    <div onClick={tappable ? onPress : undefined} accessibilityLabel={`${n}, ${label}${d.state === 'camera' && !d.shared ? ', private' : ''}`}
      style={{ ...base, ...s[d.state] }}>
      {d.state === 'camera' ? <img src={d.cover_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', left: 4, top: 3, fontSize: 10, lineHeight: '12px', fontWeight: '500', fontVariantNumeric: 'tabular-nums',
        color: d.state === 'self' ? color.canvas : d.state === 'camera' || d.state === 'today' ? color.textPrimary : color.textSecondary,
        textShadow: d.state === 'camera' ? '0 1px 2px rgba(0,0,0,0.9)' : undefined }}>{n}</div>
      {/* glyphs: snowflake (freeze, textPrimary), shield (Last Stand, brandText), both 14, centred.
          lock 9 on a 16pt ink-72% disc, bottom-right, owner only, when d.state==='camera' && !d.shared */}
    </div>
  );
}

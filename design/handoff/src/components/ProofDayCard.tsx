import React from 'react';
import { color, type, radius, space } from '../tokens';

// Profile -> Proofs. The unit is a DAY, not a photo: a user with 6 photos on Friday had six
// tiles saying the same date, and the thing they navigate by is the day.

export type ProofDay = {
  dateKey: string;           // "2026-09-19"
  dateLabel: string;         // "Today" | "Yesterday" | "Fri 19 Sep"
  coverUri: string | null;
  photoCount: number;        // in the OWNER view: all photos. In the visitor view: shared only.
  hasPrivate: boolean;       // owner view only; always false for a visitor
};

const SCRIM = 'linear-gradient(to bottom, rgba(15,15,15,0) 38%, rgba(15,15,15,0.8) 100%)';

export function ProofDayCard({ day, onPress }: { day: ProofDay; onPress?: (k: string) => void }) {
  const n = day.photoCount;
  return (
    <div
      role="button"
      aria-label={`${day.dateLabel}, ${n} photo${n === 1 ? '' : 's'}${day.hasPrivate ? ', includes private' : ''}`}
      onClick={() => onPress?.(day.dateKey)}
      style={{ position: 'relative', aspectRatio: '1', borderRadius: radius.input, overflow: 'hidden', background: color.surface }}
    >
      {day.coverUri ? <img src={day.coverUri} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '58%', background: SCRIM }} />
      <div style={{ position: 'absolute', left: 7, right: 7, bottom: 20, ...type.caption, fontWeight: '500', color: color.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{day.dateLabel}</div>
      <div style={{ position: 'absolute', left: 7, right: day.hasPrivate ? 24 : 7, bottom: 5, ...type.label, letterSpacing: 'normal', textTransform: 'none', color: color.textSecondary }}>
        {n} photo{n === 1 ? '' : 's'}
      </div>
      {/* The day wears the lock when ANY photo in it is private, so the owner can see at a
          glance which days hold something nobody else has seen. */}
      {day.hasPrivate ? (
        <div aria-hidden="true" style={{ position: 'absolute', right: 5, bottom: 4, width: 16, height: 16, borderRadius: radius.pill, background: 'rgba(15,15,15,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i data-lucide="lock" style={{ width: 9, height: 9, color: color.textPrimary }} />
        </div>
      ) : null}
    </div>
  );
}

// A visitor's list is built from shared photos only, and a day with none is DROPPED — not
// rendered empty. A gap where a day should be is itself a disclosure (R3).
export function visibleDays(days: ProofDay[], isOwner: boolean) {
  return isOwner ? days : days.filter(d => d.photoCount > 0);
}

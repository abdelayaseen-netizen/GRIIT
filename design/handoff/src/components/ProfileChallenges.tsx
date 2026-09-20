import React from 'react';
import { color, type, space, border, hit } from '../tokens';

// Profile → Challenges. Running and Finished, so a challenge that ends moves rather than
// disappearing. One line per status that active_challenges.status already carries — no
// fourth word invented, and nothing coloured by outcome.

export type ChallengeStatus = 'active' | 'completed' | 'abandoned' | 'failed';

export type ChallengeRow = {
  id: string;
  title: string;
  status: ChallengeStatus;
  duration_days: number;     // N
  current_day: number;       // n, calendar position, clamped to N
  secured_days: number;
  ended_on_day?: number;
  secured_today?: boolean;
  tasks_today?: number;
  started_at: string;
  ended_at?: string;
};

// "Day {n} of {N}" is calendar position and advances every day.
// "{secured} of {N}" is the secured count and advances only on a secured day.
// They are never mixed, and a finished run has no meaningful position.
export function statusLine(c: ChallengeRow): string {
  switch (c.status) {
    case 'active':    return `Day ${Math.min(c.current_day, c.duration_days)} of ${c.duration_days}`;
    case 'completed': return `${c.secured_days} of ${c.duration_days}`;
    case 'abandoned': return `Left on day ${c.ended_on_day}`;
    // Blunt on purpose: hard mode's contract is that one unsecured day ends the run, and
    // softening the word afterwards apologises for a rule the user chose.
    case 'failed':    return `Failed on day ${c.ended_on_day}`;
  }
}

function detailLine(c: ChallengeRow, fmt: (iso: string) => string): string {
  if (c.status === 'active') {
    return c.secured_today
      ? `${c.tasks_today} of ${c.tasks_today} secured today`
      : 'Not yet today';
  }
  return `${fmt(c.started_at)} to ${fmt(c.ended_at!)}`;
}

function Row({ c, fmt, onPress }: { c: ChallengeRow; fmt: (iso: string) => string; onPress?: () => void }) {
  return (
    <div role="button" onClick={onPress} aria-label={`Open ${c.title} challenge`}
      style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: space.md, minHeight: hit }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{c.title}</div>
        <div style={{ ...type.caption, color: color.textSecondary }}>{detailLine(c, fmt)}</div>
      </div>
      {/* Same colour for every status. Ranking a person's history is not the app's job. */}
      <div style={{ ...type.caption, color: color.textSecondary }}>{statusLine(c)}</div>
      <i data-lucide="chevron-right" style={{ width: 18, height: 18, color: color.textSecondary, flex: 'none' }} />
    </div>
  );
}

export function ProfileChallenges({ challenges, formatDate, onOpen }: {
  challenges: ChallengeRow[];
  formatDate: (iso: string) => string;
  onOpen?: (id: string) => void;
}) {
  const running = challenges.filter(c => c.status === 'active');
  // Newest ended first.
  const finished = challenges.filter(c => c.status !== 'active')
    .sort((a, b) => (b.ended_at ?? '').localeCompare(a.ended_at ?? ''));

  return (
    <>
      {running.length ? (
        <>
          <div style={{ padding: `14px ${space.gutter}px 2px`, ...type.label, color: color.textSecondary }}>Running</div>
          <div style={{ padding: `0 ${space.gutter}px` }}>
            {running.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 ? <div style={{ height: 1, background: color.border }} /> : null}
                <Row c={c} fmt={formatDate} onPress={() => onOpen?.(c.id)} />
              </React.Fragment>
            ))}
          </div>
        </>
      ) : null}

      {finished.length ? (
        <>
          <div style={{ padding: `14px ${space.gutter}px 2px`, ...type.label, color: color.textSecondary }}>Finished</div>
          <div style={{ padding: `0 ${space.gutter}px` }}>
            {finished.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 ? <div style={{ height: 1, background: color.border }} /> : null}
                <Row c={c} fmt={formatDate} onPress={() => onOpen?.(c.id)} />
              </React.Fragment>
            ))}
          </div>
          {/* Runs that predate the end screen have end_seen_at backfilled to ended_at, so
              they never fire the moment. Saying so stops it reading as a bug. */}
          <div style={{ padding: `14px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
            Runs that ended before this version shipped are here too, without an end screen.
          </div>
        </>
      ) : null}
    </>
  );
}

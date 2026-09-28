import React from 'react';
import { color, type, space, radius, displayFace, displayWeight } from '../tokens';
import { DayCell, MonthGrid, LEGEND, type DayState } from './ConsistencyGrid';

// v37 NOTE: the screen is now hero (3 metrics) + coaching line + four-state month grid + by
// challenge. The v36 principle, definitions and partition move to the info sheet; the per-day
// list moves to the day sheet opened by tapping a cell. reduce() and DayRow are unchanged and
// feed both sheets. The grid maps freeze and laststand to one visible "held" glyph via
// gridState() below; the day sheet names which.
export const gridState = (s: DayState): 'camera' | 'self' | 'held' | 'missed' | 'today' | 'none' =>
  s === 'camera' || s === 'self' || s === 'missed' || s === 'today' ? s : s === 'freeze' || s === 'laststand' ? 'held' : 'none';

export function heroMetrics(days: RecordDay[]) {
  const r = reduce(days);
  return {
    securedPct: r.closed ? Math.round((r.secured / r.closed) * 100) : null,   // "{pct}%" over "{s} of {c} days"
    streak: r.current, best: r.longest,                                         // "{n}" over "Best {b}"
    cameraPct: r.secured ? Math.round((r.camera / r.secured) * 100) : null,    // "{pct}%" over "of {s} secured"
  };
}

/** One sentence, built from the record. Never motivational; names the day and the task. */
export function coachingLine(days: RecordDay[], fmtDate: (k: string) => string): string {
  const closed = days.filter(d => d.state !== 'today' && d.state !== 'notdue' && d.state !== 'beforejoin');
  const last = [...closed].reverse().find(d => d.state === 'missed');
  const r = reduce(days);
  if (!closed.length) return 'Nothing is counted until your first day closes.';
  if (r.current > 0) return `${r.current} ${r.current === 1 ? 'day' : 'days'} running. Today closes at midnight.`;
  if (last && last.missedTaskNames.length === 1) return `${fmtDate(last.dateKey)} broke on one task, ${last.missedTaskNames[0].toLowerCase()}. Take it first today.`;
  if (last) return `${fmtDate(last.dateKey)} broke on ${last.missedTaskNames.length} tasks. Start with ${last.missedTaskNames[0].toLowerCase()} today.`;
  return 'Today closes at midnight.';
}

// v36. One argument, top down: the principle, the number and its denominator, the month,
// how the number was earned, each day. Every number is a reduction over `days` — nothing
// here is a prop authored beside it (v35 rule).

export type RecordDay = {
  dateKey: string;            // "2026-09-21"
  state: DayState;            // eight states; see ConsistencyGrid
  done: number;               // tasks completed that day, across every enrollment due
  required: number;           // tasks required that day
  cameraProofs: number;
  missedTaskNames: string[];
  orphaned?: boolean;         // day_secures row with no task completions on record
};

export type ChallengeWindow = { name: string; closedDueDays: number; secured: number; joinedToday?: boolean };

const DISPLAY = displayFace;
const isSecured = (s: DayState) => s === 'camera' || s === 'self';

// Counting rule (build 64): today counts as soon as it is secured. An unsecured today is
// never a miss — it stays 'today' and is excluded. A secured today arrives as 'camera' or
// 'self' and is counted like any closed day.
export function reduce(days: RecordDay[]) {
  const closed = days.filter(d => d.state !== 'today' && d.state !== 'notdue' && d.state !== 'beforejoin');
  const count = (s: DayState) => closed.filter(d => d.state === s).length;
  const secured = count('camera') + count('self');
  // Held days continue a run; only a miss ends one.
  let run = 0, best = 0, bestEnd = -1;
  closed.forEach((d, i) => { if (d.state === 'missed') run = 0; else { run++; if (run > best) { best = run; bestEnd = i; } } });
  let current = 0;
  for (let i = closed.length - 1; i >= 0 && closed[i].state !== 'missed'; i--) current++;
  return {
    closed: closed.length, secured,
    camera: count('camera'), self: count('self'), freeze: count('freeze'), laststand: count('laststand'), missed: count('missed'),
    current, longest: best,
    longestFrom: bestEnd >= 0 ? closed[bestEnd - best + 1].dateKey : null,
    longestTo: bestEnd >= 0 ? closed[bestEnd].dateKey : null,
  };
}

function dayLine(d: RecordDay): string {
  if (d.orphaned) return 'Secured. No task record for this day.';
  if (d.state === 'today') return `${d.done} of ${d.required} tasks so far. Closes at midnight.`;
  const base = `${d.done} of ${d.required} tasks`;
  if (d.state === 'camera') return `${base} · ${d.cameraProofs} camera proof${d.cameraProofs === 1 ? '' : 's'}`;
  if (d.state === 'missed') {
    const m = d.missedTaskNames;
    // One name fits on the line; more than one collapses to a count so the row never wraps.
    return m.length === 1 ? `${base} · ${m[0]} missed` : `${base} · ${m.length} missed`;
  }
  return base;
}

export function DayRow({ day, label, expanded, onToggle }: { day: RecordDay; label: string; expanded?: boolean; onToggle?: () => void }) {
  const expandable = day.state === 'missed' && day.missedTaskNames.length > 1;
  return (
    <div>
      <div onClick={expandable ? onToggle : undefined}
        aria-label={`${label}. ${dayLine(day)}`}
        style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
        <DayCell state={day.state} size={22} />
        <div style={{ width: 66, flex: 'none', ...type.secondary, fontWeight: '500', color: day.state === 'today' ? color.brandText : color.textPrimary }}>{label}</div>
        <div style={{ flex: 1, ...type.caption, color: color.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayLine(day)}</div>
        {expandable ? <i data-lucide={expanded ? 'chevron-up' : 'chevron-down'} style={{ width: 16, height: 16, color: color.textSecondary }} /> : null}
      </div>
      {expandable && expanded ? (
        <div style={{ padding: '0 0 12px 34px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {day.missedTaskNames.map(t => <div key={t} style={{ ...type.caption, color: color.textSecondary }}>{t}</div>)}
        </div>
      ) : null}
    </div>
  );
}

export function ConsistencyScreen(p: {
  days: RecordDay[]; month: { label: string; leadingBlanks: number; days: RecordDay[] };
  joinedLabel: string; challenges: ChallengeWindow[]; cameraRuleLine?: string;
  formatDay: (k: string) => string; formatLong: (k: string) => string;
}) {
  const r = reduce(p.days);
  const m = reduce(p.month.days);
  const [open, setOpen] = React.useState<string | null>(null);
  const partition: Array<[DayState, number, string]> = [
    ['camera', r.camera, 'with a camera proof'], ['self', r.self, 'self-reported'],
    ['freeze', r.freeze, 'held by a freeze'], ['laststand', r.laststand, 'held by a Last Stand'], ['missed', r.missed, 'not secured'],
  ];
  const pad = `0 ${space.gutter}px`;
  return (
    <div style={{ background: color.canvas, paddingBottom: 40 }}>
      <div style={{ padding: `14px ${space.gutter}px 0`, ...type.bodyStrong, color: color.textPrimary }}>A day is secured or it is not.</div>
      <div style={{ padding: `4px ${space.gutter}px 0`, ...type.secondary, color: color.textSecondary }}>
        A part-done day counts for nothing. Every day you were due is counted here, so the record is not shorter than the truth.
      </div>

      <div style={{ padding: `20px ${space.gutter}px 0`, display: 'flex', alignItems: 'flex-end', gap: 9 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 58, lineHeight: '52px', fontWeight: displayWeight, fontVariantNumeric: 'tabular-nums' }}>{r.secured}</div>
        <div style={{ ...type.secondary, color: color.textSecondary, paddingBottom: 9 }}>of {r.closed} days secured</div>
      </div>
      <div style={{ padding: `8px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
        Every day you were in a challenge counts, from {p.joinedLabel}. Today counts once it is secured. An unsecured today is never a miss.
      </div>

      <div style={{ padding: `20px ${space.gutter}px 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ ...type.bodyStrong }}>{p.month.label}</div>
        <div style={{ ...type.caption, color: color.textSecondary }}>{m.secured} of {m.closed} days secured</div>
      </div>
      <div style={{ padding: `12px ${space.gutter}px 0` }}><MonthGrid days={p.month.days.map(d => d.state)} leadingBlanks={p.month.leadingBlanks} /></div>
      <div style={{ padding: `16px ${space.gutter}px 0`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
        {LEGEND.map(([s, l]) => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DayCell state={s} size={16} legend /><div style={{ ...type.label, textTransform: 'none', letterSpacing: 'normal', color: color.textSecondary }}>{l}</div></div>)}
      </div>

      <div style={{ padding: `28px ${space.gutter}px 0`, ...type.label, color: color.textSecondary }}>How it was earned</div>
      <div style={{ padding: `8px ${space.gutter}px 0`, ...type.secondary, color: color.textSecondary }}>Of your {r.closed} days:</div>
      <div style={{ padding: pad }}>
        {partition.map(([s, n, l]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 40, borderTop: s === 'camera' ? undefined : `1px solid ${color.border}` }}>
            <DayCell state={s} size={18} />
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: displayWeight, width: 30, textAlign: 'right', color: n ? color.textPrimary : color.textSecondary }}>{n}</div>
            <div style={{ ...type.secondary, color: color.textSecondary }}>{l}</div>
          </div>
        ))}
      </div>
      {p.cameraRuleLine ? <div style={{ padding: `10px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>{p.cameraRuleLine}</div> : null}

      <div style={{ padding: `22px ${space.gutter}px 0`, ...type.label, color: color.textSecondary }}>Streak</div>
      <div style={{ padding: `8px ${space.gutter}px 0`, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: displayWeight }}>{r.current}</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>days now.</div>
      </div>
      {r.longestFrom ? (
        <div style={{ padding: `6px ${space.gutter}px 0`, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: displayWeight }}>{r.longest}</div>
          <div style={{ ...type.secondary, color: color.textSecondary }}>days longest, {p.formatLong(r.longestFrom)} to {p.formatLong(r.longestTo!)}.</div>
        </div>
      ) : null}

      <div style={{ padding: `22px ${space.gutter}px 0`, ...type.label, color: color.textSecondary }}>By challenge</div>
      <div style={{ padding: `10px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {p.challenges.map(c => (
          <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ ...type.secondary, fontWeight: '500' }}>{c.name}</div>
              <div style={{ ...type.caption, color: color.textSecondary }}>
                {c.closedDueDays === 0 ? 'Joined today. Nothing to count yet.' : `${c.secured} of ${c.closedDueDays} days secured`}
              </div>
            </div>
            {c.closedDueDays > 0 ? (
              <div style={{ height: 5, borderRadius: 3, background: color.border, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((c.secured / c.closedDueDays) * 100)}%`, height: '100%', background: color.brand }} />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ padding: `28px ${space.gutter}px 0`, ...type.label, color: color.textSecondary }}>Each day</div>
      <div style={{ padding: pad }}>
        {[...p.days].reverse().filter(d => d.state !== 'notdue' && d.state !== 'beforejoin').map(d => (
          <DayRow key={d.dateKey} day={d} label={d.state === 'today' ? 'Today' : p.formatDay(d.dateKey)}
            expanded={open === d.dateKey} onToggle={() => setOpen(open === d.dateKey ? null : d.dateKey)} />
        ))}
      </div>
    </div>
  );
}

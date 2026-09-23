import React from 'react';
import { color, type, space, radius, border, buttonHeight, displayFace, numberSize } from '../tokens';

// The end of a challenge. Fires once, on the first launch after the challenge's end date
// has passed in the USER'S TIMEZONE — not when a day counter exceeds duration_days, which
// would end the run at the clock time they joined and cost a 4pm joiner eight hours of
// their last day. Gated on end_seen_at so it shows once and never again.

export type DayState = 'camera' | 'self' | 'missed' | 'frozen' | 'last_stand';

export type EndedChallenge = {
  id: string;
  title: string;
  duration_days: number;         // N. The denominator, always — never days.length
  status: 'completed' | 'abandoned' | 'failed';
  ended_on_day: number;          // for abandoned / failed
  days: DayState[];              // one per elapsed day, in order
  // Must equal longestStreak(days). A freeze or Last Stand preserves the streak, so it
  // continues a run; only a miss breaks one. Passing a server value that disagrees with
  // days[] puts a number on the card that the sheet above it contradicts — assert in dev.
  longest_streak: number;
  started_at: string;
  ended_at: string;
};

const SECURED: DayState[] = ['camera', 'self'];
const BREAKS: DayState = 'missed';

/** The streak reading of days[]: held days continue a run, only a miss ends one. */
export function longestStreak(days: DayState[]) {
  let run = 0, best = 0;
  for (const d of days) { if (d === BREAKS) run = 0; else { run++; if (run > best) best = run; } }
  return best;
}

// A frozen or Last Stand day is NOT secured. The streak survived it; the day did not.
// Counting a held day as secured would claim work that never happened.
export function securedCount(days: DayState[]) {
  return days.filter(d => SECURED.includes(d)).length;
}

function factLine(c: EndedChallenge): string {
  const secured = securedCount(c.days);
  const cam = c.days.filter(d => d === 'camera').length;
  const self = c.days.filter(d => d === 'self').length;
  const frozen = c.days.filter(d => d === 'frozen').length;
  const stand = c.days.filter(d => d === 'last_stand').length;
  const unsecured = c.days.length - secured;

  if (c.status === 'failed') return 'Hard mode has no freezes, so one unsecured day ends the run.';
  if (c.duration_days === 1) return secured ? `One day, secured. ${cam ? 'Camera proof.' : 'Self-reported.'}` : 'One day, not secured.';
  // "none missed" can only be said of a run that reached its end: a run abandoned on day 9
  // with 9 secured days missed 66, it did not go clean.
  if (unsecured === 0 && c.days.length === c.duration_days) return `${c.duration_days} days, none missed. ${cam} camera proof, ${self} self-reported.`;
  if (unsecured === 0) return `${secured} of ${c.days.length} days secured before it ended. ${cam} camera proof, ${self} self-reported.`;

  const held = frozen + stand;
  const base = `${unsecured} day${unsecured === 1 ? '' : 's'} went unsecured.`;
  if (!held) return `${base} ${cam} camera proof, ${self} self-reported.`;
  const parts = [frozen ? `${frozen === 1 ? 'a freeze' : frozen + ' freezes'}` : null,
                 stand ? `${stand === 1 ? 'a Last Stand' : stand + ' Last Stands'}` : null].filter(Boolean);
  return `${base} ${held} of them ${held === 1 ? 'was' : 'were'} held, by ${parts.join(' and ')}.`;
}

// Value and form carry the state, never opacity: surface is 1.09:1 against canvas, so a
// surface-filled tile and an empty one are the same square at 27pt. Same encoding as
// ds/WeekStrip.
// size is the rendered edge of the tile, and the plug scales from it. Hardcoding the plug
// breaks the legend: tiles are border-box, so an 11pt swatch has a 9pt content box (8pt at
// the Last Stand's 1.5pt border) and a fixed 9pt plug fills it edge to edge — Frozen would
// render as solid border and Last Stand as solid brand, collapsing them onto Self-reported
// and Camera proof, in the one key that explains the sheet.
function Tile({ state, size = 27 }: { state: DayState; size?: number }) {
  const fill = state === 'camera' ? color.brand : state === 'self' ? color.border : 'transparent';
  const stroke = state === 'last_stand' ? color.brand : (state === 'camera' || state === 'self') ? 'transparent' : color.border;
  const plug = state === 'frozen' ? color.border : state === 'last_stand' ? color.brand : null;
  return (
    <div style={{
      aspectRatio: '1', borderRadius: 3, background: fill,
      border: `${state === 'last_stand' ? 1.5 : 1}px solid ${stroke}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {plug ? (() => { const d = Math.max(4, Math.round(size * 0.34)); return <div style={{ width: d, height: d, borderRadius: 2, background: plug }} />; })() : null}
    </div>
  );
}

const LEGEND: [DayState, string][] = [
  ['camera', 'Camera proof'], ['self', 'Self-reported'], ['missed', 'Not secured'],
  ['frozen', 'Frozen'], ['last_stand', 'Last Stand'],
];

// 12 columns for every sheet on the single screen, whatever the day count: 75 days at 10
// across is 8 rows and 285pt, which leaves no room for a five-item legend and the stats
// card; at 12 it is 7 rows and 213pt with 27pt tiles. A shorter run keeps the same column
// count and simply has fewer rows — widening the tiles for a 28-day run would make two end
// screens in the same app disagree about how big a day is.
const COLS = 12;
const COMBINED_COLS = 15;

function Sheet({ days, cols = COLS }: { days: DayState[]; cols?: number }) {
  // A one-day challenge centres its single tile rather than stretching it across a grid.
  if (days.length === 1) {
    return <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ width: 27 }}><Tile state={days[0]} /></div></div>;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 3 }}>
      {days.map((s, i) => <Tile key={i} state={s} />)}
    </div>
  );
}

function Legend({ days }: { days: DayState[] }) {
  const present = LEGEND.filter(([s]) => days.includes(s));
  return (
    <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      {present.map(([s, label]) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 11, height: 11, flex: 'none' }}><Tile state={s} size={11} /></div>
          <div style={{ ...type.caption, color: color.textSecondary }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// Place held days outside the longest run wherever a fixture is authored, so the sheet's
// filled-run reading and longestStreak() give the same answer. They diverge otherwise, and
// the legend sits directly under the sheet inviting the reader to count.
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, ...type.secondary, color: color.textSecondary }}>{label}</div>
      <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{value}</div>
    </div>
  );
}

function Button({ label, variant = 'primary', onPress }: { label: string; variant?: 'primary' | 'secondary'; onPress?: () => void }) {
  return (
    <div role="button" onClick={onPress} style={{
      height: buttonHeight.regular, borderRadius: radius.pill,
      background: variant === 'primary' ? color.primary : color.surface,
      border: variant === 'secondary' ? border : undefined,
      color: color.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...type.bodyStrong,
    }}>{label}</div>
  );
}

export type ChallengeEndProps = {
  // One or more. Several challenges can end on the same local day.
  challenges: EndedChallenge[];
  activeCount: number;
  challengeLimit: number | null;   // null = no cap (Pro)
  formatDate: (iso: string) => string;
  onDone?: () => void;
  onRestart?: (id: string) => void;
};

export function ChallengeEnd(p: ChallengeEndProps) {
  return p.challenges.length > 1 ? <Combined {...p} /> : <Single {...p} />;
}

function Single(p: ChallengeEndProps) {
  const c = p.challenges[0];
  const secured = securedCount(c.days);
  const atCap = p.challengeLimit != null && p.activeCount >= p.challengeLimit;

  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      <div style={{ padding: `${space.md}px ${space.gutter}px 0`, display: 'flex', justifyContent: 'flex-end' }}>
        <div role="button" onClick={p.onDone} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <i data-lucide="x" style={{ width: 22, height: 22, color: color.textSecondary }} />
        </div>
      </div>

      <div style={{ padding: `2px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...type.label, color: color.textSecondary }}>Days secured</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: space.sm }}>
          <div style={{ fontFamily: displayFace, fontSize: numberSize.moment, lineHeight: '88px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: color.textPrimary }}>{secured}</div>
          {/* N, not elapsed. A run that failed on day 28 of 75 reads "27 of 75". */}
          <div style={{ ...type.heading, color: color.textSecondary }}>of {c.duration_days}</div>
        </div>
      </div>

      <div style={{ padding: `${space.md}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.xs }}>
        <div style={{ ...type.bodyStrong, color: color.textPrimary }}>
          {c.status === 'failed' ? `${c.title} ended on day ${c.ended_on_day}.` : `${c.title} is over.`}
        </div>
        <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center', maxWidth: 300 }}>{factLine(c)}</div>
      </div>

      <div style={{ padding: `${space.md}px ${space.gutter}px 0` }}><Sheet days={c.days} /></div>
      <Legend days={c.days} />

      <div style={{ padding: `${space.md}px ${space.gutter}px 0` }}>
        <div style={{ background: color.surface, border, borderRadius: radius.card, padding: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Stat label="Longest streak" value={`${c.longest_streak} ${c.longest_streak === 1 ? 'day' : 'days'}`} />
          <Stat label="Started" value={p.formatDate(c.started_at)} />
          <Stat label="Ended" value={p.formatDate(c.ended_at)} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `10px ${space.gutter}px 26px`, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Button label="Done" onPress={p.onDone} />
        <Button label="Start it again" variant="secondary" onPress={() => p.onRestart?.(c.id)} />
        {/* Enabled at the cap, with the price stated. A button that vanishes cannot explain itself. */}
        {atCap ? (
          <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>
            You are running {p.activeCount} of {p.challengeLimit}. Starting this again means leaving one.
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Several endings on one day get ONE screen. Two full-screen interruptions on a single
// launch is the app taking the user's morning. No restart button here: with two endings it
// would have to pick one, and there is no honest basis for the pick.
function Combined(p: ChallengeEndProps) {
  const all = p.challenges.flatMap(c => c.days);
  const n = p.challenges.length;
  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      <div style={{ padding: `${space.md}px ${space.gutter}px 0`, display: 'flex', justifyContent: 'flex-end' }}>
        <div role="button" onClick={p.onDone} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <i data-lucide="x" style={{ width: 22, height: 22, color: color.textSecondary }} />
        </div>
      </div>

      <div style={{ padding: `2px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ ...type.title, color: color.textPrimary }}>{n === 2 ? 'Two' : n} challenges ended.</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>
          {n === 2 ? 'Both' : 'All'} finished today, {p.formatDate(p.challenges[0].ended_at)}.
        </div>
      </div>

      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {p.challenges.map((c, i) => (
          <React.Fragment key={c.id}>
            {i > 0 ? <div style={{ height: 1, background: color.border }} /> : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md }}>
                <div style={{ flex: 1, ...type.bodyStrong, color: color.textPrimary }}>{c.title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <div style={{ fontFamily: displayFace, fontSize: 34, lineHeight: '32px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: color.textPrimary }}>{securedCount(c.days)}</div>
                  <div style={{ ...type.secondary, color: color.textSecondary }}>of {c.duration_days}</div>
                </div>
              </div>
              <Sheet days={c.days} cols={COMBINED_COLS} />
              <div style={{ ...type.caption, color: color.textSecondary }}>{factLine(c)}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <Legend days={all} />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `10px ${space.gutter}px 26px`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Button label="Done" onPress={p.onDone} />
        <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>
          {n === 2 ? 'Both are' : 'They are all'} in Profile, Finished. Start {n === 2 ? 'either' : 'any'} again from there.
        </div>
      </div>
    </div>
  );
}

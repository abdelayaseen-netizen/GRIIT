import React from 'react';
import { color, type, space, radius, border, buttonHeight, hit, displayFace, numberSize } from '../tokens';
import { Stamp } from './Stamp';
import { Divider } from './Primitives';

// The screen a user sees inside a challenge they joined. It answers one question:
// what is left today, and where am I in the run. No hero block, no percentages,
// no social row unless there is someone else in it.

export type TaskType = 'timer' | 'reading' | 'water' | 'counter' | 'photo' | 'checkin' | 'journal' | 'workout';

export type Task = {
  title: string;
  task_type: TaskType;
  duration_minutes?: number;
  target_value?: number;
  unit?: string;
  require_photo: boolean;          // what was asked
  completed_today: boolean;
  verified?: boolean;              // what came back: camera proof on the completion row
  proof_photo_url?: string | null;
};

export type ActiveChallengeProps = {
  title: string;
  duration_days: number;
  current_day: number;
  difficulty: 'standard' | 'hard';
  tasks: Task[];
  // Server field, from day_secures via getSecuredDateKeys. Never derived here from
  // tasks.every(completed_today): if the server has not secured the day, the client does not.
  secured_today: boolean;
  streak_days: number;
  week_secured: boolean[];      // 7, Monday first
  today_index: number;          // 0..6
  participants_count: number;
  description?: string;
  // Renders only when the backend exposes a reset event (a reset row on the challenge
  // participant, or started_at newer than joined_at). Never inferred from current_day === 1.
  reset_notice?: boolean;
  onBack?: () => void;
  onMore?: () => void;
  onTask?: (i: number) => void;
  onParticipants?: () => void;
  onShare?: () => void;
};

const ICON: Record<TaskType, string> = {
  timer: 'timer', reading: 'book-open', water: 'droplet', counter: 'hash',
  photo: 'camera', checkin: 'map-pin', journal: 'notebook-pen', workout: 'dumbbell',
};

// The action verb is a property of the task type, never a generic "Start".
const VERB: Record<TaskType, string> = {
  timer: 'Start timer', reading: 'Log pages', water: 'Log water', counter: 'Log count',
  photo: 'Take photo', checkin: 'Check in', journal: 'Write entry', workout: 'Log workout',
};

// The real gate, built only from fields that exist.
function gate(t: Task): string {
  const size =
    t.task_type === 'timer' || t.task_type === 'workout'
      ? t.duration_minutes ? `${t.duration_minutes} min timer` : ''
      : t.target_value != null ? `${t.target_value}${t.unit ? ' ' + t.unit : ''}` : '';
  const proof = t.require_photo ? 'Photo required' : 'Self-reported';
  return [size, proof].filter(Boolean).join(' · ');
}

function doneGate(t: Task): string {
  return gate(t).split(' · ')[0] === 'Photo required' ? 'Photo' : gate(t).split(' · ')[0];
}

const Icon = ({ name, size = 24, tone = color.textSecondary }: { name: string; size?: number; tone?: string }) =>
  <i data-lucide={name} style={{ width: size, height: size, color: tone, flex: 'none' }} />;

export function ActiveChallenge(p: ActiveChallengeProps) {
  const done = p.tasks.filter(t => t.completed_today).length;
  const left = p.tasks.length - done;
  const next = p.tasks.find(t => !t.completed_today);
  // The stamp is a claim about what the server returned, so it reads the completion.
  const hasProof = (t: Task) => !!(t.verified || t.proof_photo_url);

  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      {/* nav: one header only */}
      <div style={{ height: hit, paddingLeft: space.gutter, paddingRight: space.md, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={p.onBack} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center' }}><Icon name="chevron-left" tone={color.textPrimary} /></div>
        <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{p.title}</div>
        <div onClick={p.onMore} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><Icon name="ellipsis" tone={color.textPrimary} /></div>
      </div>

      {/* position. The day is the only display number here. Format is always "Day n of n". */}
      <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0`, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ ...type.secondary, color: color.textSecondary, paddingBottom: 11 }}>Day</div>
        <div style={{ fontFamily: displayFace, fontSize: numberSize.home, lineHeight: '56px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: color.textPrimary }}>{p.current_day}</div>
        <div style={{ ...type.body, color: color.textSecondary, paddingBottom: 9 }}>of {p.duration_days}</div>
      </div>

      {/* what is left, derived from completed_today only */}
      {p.secured_today ? (
        <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.brandText }}>Day secured.</div>
          <div style={{ ...type.secondary, color: color.textSecondary }}>All {p.tasks.length} done.</div>
        </div>
      ) : (
        <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, ...type.secondary, color: color.textSecondary }}>
          {done === 0 ? 'Nothing done today.' : `${done} of ${p.tasks.length} done.`}
          {left > 0 ? ` ${left} ${left === 1 ? 'task' : 'tasks'} left.` : ''}
        </div>
      )}

      {/* hard mode restart. Surface card, no danger colour: it is a fact, not an error. */}
      {p.reset_notice ? (
        <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
          <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.gutter, display: 'flex', gap: space.lg, alignItems: 'flex-start' }}>
            <Icon name="rotate-ccw" tone={color.textPrimary} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <div style={{ ...type.bodyStrong, color: color.textPrimary }}>The run restarted</div>
              <div style={{ ...type.secondary, color: color.textSecondary }}>A day went unsecured. Hard mode has no freezes, so the count went back to Day 1 of {p.duration_days}.</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* week strip: filled when the day was secured, brand outline on today */}
      <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0`, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: space.sm }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.sm }}>
            <div style={{ ...type.caption, color: color.textSecondary }}>{d}</div>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: radius.input,
              background: p.week_secured[i] ? color.brand : 'transparent',
              border: i === p.today_index ? `1.5px solid ${color.brand}` : border,
            }} />
          </div>
        ))}
      </div>

      {/* difficulty and streak. Hard mode states the freeze rule here. */}
      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, display: 'flex', gap: space.gutter, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name={p.difficulty === 'hard' ? 'shield-off' : 'shield'} size={16} />
          <div style={{ ...type.caption, color: color.textSecondary }}>{p.difficulty === 'hard' ? 'Hard mode. No freezes.' : 'Standard mode'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="flame" size={16} />
          {p.streak_days > 0 ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <div style={{ fontFamily: displayFace, fontSize: numberSize.inline, lineHeight: '18px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: color.textPrimary }}>{p.streak_days}</div>
              <div style={{ ...type.caption, color: color.textSecondary }}>day streak</div>
            </div>
          ) : (
            <div style={{ ...type.caption, color: color.textSecondary }}>{p.current_day === 1 ? 'No streak yet' : 'No streak'}</div>
          )}
        </div>
      </div>

      <div style={{ padding: `${space.section}px ${space.gutter}px ${space.xs}px`, ...type.heading, color: color.textPrimary }}>Today</div>

      {/* Task rows are rows on the canvas, not cards: no box inside a box. */}
      <div style={{ padding: `0 ${space.gutter}px` }}>
        {p.tasks.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <Divider /> : null}
            <div onClick={t.completed_today ? undefined : () => p.onTask?.(i)} style={{ padding: `${space.lg}px 0`, display: 'flex', alignItems: 'center', gap: space.lg, minHeight: hit }}>
              <Icon name={t.completed_today ? 'check' : ICON[t.task_type]} tone={t.completed_today ? color.brandText : color.textSecondary} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ ...type.bodyStrong, color: t.completed_today ? color.textSecondary : color.textPrimary }}>{t.title}</div>
                <div style={{ ...type.caption, color: color.textSecondary }}>{t.completed_today ? doneGate(t) : gate(t)}</div>
              </div>
              {t.completed_today
                ? (hasProof(t) ? <Stamp /> : <div style={{ ...type.caption, color: color.textSecondary, flex: 'none' }}>Self-reported</div>)
                : <div style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.brandText, flex: 'none' }}>{VERB[t.task_type]}</div>}
            </div>
          </React.Fragment>
        ))}

        {/* No social row at all when the user is alone in it. No avatars: there is no avatar data. */}
        {p.participants_count > 1 ? (
          <>
            <Divider />
            <div onClick={p.onParticipants} style={{ padding: `${space.lg}px 0`, display: 'flex', alignItems: 'center', gap: space.lg, minHeight: hit }}>
              <Icon name="users" />
              <div style={{ flex: 1, ...type.bodyStrong, color: color.textPrimary }}>{p.participants_count} in this challenge</div>
              <Icon name="chevron-right" />
            </div>
          </>
        ) : null}
      </div>

      {/* No About section when there is no description. */}
      {p.description ? (
        <>
          <div style={{ padding: `${space.section}px ${space.gutter}px ${space.xs}px`, ...type.heading, color: color.textPrimary }}>About</div>
          <div style={{ padding: `0 ${space.gutter}px`, ...type.secondary, color: color.textSecondary }}>{p.description}</div>
        </>
      ) : null}

      <div style={{ height: 140 }} />

      {/* The pinned button names the task it starts. Secured days have nothing left to do. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.gutter}px ${space.gutter}px ${space.section}px`, background: color.canvas, borderTop: border }}>
        {p.secured_today ? (
          <div onClick={p.onShare} style={{ height: buttonHeight.regular, borderRadius: radius.pill, background: color.surface, border, color: color.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong }}>Share today's proof</div>
        ) : next ? (
          <div onClick={() => p.onTask?.(p.tasks.indexOf(next))} style={{ height: buttonHeight.regular, borderRadius: radius.pill, background: color.brand, color: color.onBrand, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong }}>
            {VERB[next.task_type]} · {next.title}
          </div>
        ) : null}
      </div>
    </div>
  );
}

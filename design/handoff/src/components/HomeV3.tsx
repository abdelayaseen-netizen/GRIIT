import React from 'react';
import { color, type, space, radius, border, hit } from '../tokens';

// Today's proof card on Home. It lists every required task across every active
// enrollment for today, one row per task, so the user chooses the order.
// The rows are the call to action: there is no per-row button and no primary
// button under the list.

export type Gate = 'camera' | 'time_window' | 'location';

export type TodayTask = {
  id: string;
  name: string;
  gates: Gate[];
  time_window?: string;   // "6–9am", only meaningful with the time_window gate
  done: boolean;
};

export type TodayEnrollment = {
  challenge_id: string;
  challenge_name: string;
  tasks: TodayTask[];
};

export type TodayCardProps = {
  // Active enrollments in enrollment order.
  enrollments: TodayEnrollment[];
  // The same server flag Home already uses. Never derived here from the rows.
  day_secured: boolean;
  onTask?: (challengeId: string, taskId: string) => void;
};

// Only three real gates exist. A task with none is self-reported, and the card
// never claims verification the app cannot enforce.
function gateLabel(t: TodayTask): string {
  if (!t.gates.length) return 'Self-reported';
  return t.gates
    .map(g => (g === 'camera' ? 'Camera' : g === 'location' ? 'Location' : `Time window ${t.time_window ?? ''}`.trim()))
    .join(' · ');
}

function TaskRow({ t, onTap }: { t: TodayTask; onTap?: () => void }) {
  return (
    <div
      onClick={t.done ? undefined : onTap}
      style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: hit }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: radius.pill, flex: 'none',
        background: t.done ? color.brand : 'transparent',
        border: t.done ? undefined : `1.5px solid ${color.textSecondary}`,
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Done rows drop to textSecondary. No strike-through. */}
        <div style={{ ...type.bodyStrong, color: t.done ? color.textSecondary : color.textPrimary }}>{t.name}</div>
        <div style={{ ...type.caption, color: color.textSecondary }}>{gateLabel(t)}</div>
      </div>
      {t.done ? null : <i data-lucide="chevron-right" style={{ width: 20, height: 20, color: color.textSecondary, flex: 'none' }} />}
    </div>
  );
}

export function TodayCard(p: TodayCardProps) {
  // Undone first inside each challenge; challenges stay in enrollment order.
  const groups = p.enrollments.map(e => ({
    ...e,
    tasks: [...e.tasks].sort((a, b) => Number(a.done) - Number(b.done)),
  }));
  const all = groups.flatMap(g => g.tasks);
  const done = all.filter(t => t.done).length;

  // One challenge groups nothing, so it carries no label.
  const labelled = groups.length > 1;

  return (
    <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.gutter, display: 'flex', flexDirection: 'column', gap: space.lg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ ...type.heading, color: color.textPrimary }}>Today</div>
        <div style={{ flex: 'none', padding: '6px 12px', borderRadius: radius.input, background: color.brandWash, ...type.caption, fontWeight: '500', color: color.brandText }}>
          {done} / {all.length}
        </div>
      </div>

      {groups.map(g => (
        <div key={g.challenge_id} style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
          {labelled ? <div style={{ ...type.caption, color: color.textSecondary }}>{g.challenge_name}</div> : null}
          {g.tasks.map(t => <TaskRow key={t.id} t={t} onTap={() => p.onTask?.(g.challenge_id, t.id)} />)}
        </div>
      ))}

      {p.day_secured ? (
        <div style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.brandText }}>Day secured.</div>
      ) : null}
    </div>
  );
}

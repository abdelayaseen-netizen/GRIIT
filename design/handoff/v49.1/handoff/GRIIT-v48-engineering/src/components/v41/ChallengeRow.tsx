import React from 'react';
import { color, type, radius } from '../../tokens';

// Frame 118. Profile → Challenges. One status line, one number on the right.
// Reads active_challenges.status: active | completed | abandoned | failed.

export type ChallengeRowData = {
  id: string; title: string; category: 'Fitness' | 'Faith' | 'Mind' | 'Health' | 'Discipline' | 'Learning';
  status: 'active' | 'completed' | 'abandoned' | 'failed';
  start_at: string; end_at?: string; duration_days: number;
  day_n: number;                    // calendar position, clamped to duration_days
  secured_count: number;            // secured days in this run
  days_in_run: number;              // days actually in the run (to end, leave or fail)
  tasks_left_today: number;         // required tasks not yet done today
  secured_today: boolean;           // server
  starts_tomorrow: boolean;         // F3: start_at is after today, member timezone
  left_on_day?: number;
};

const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// "Sep 16–24", "Sep 26", "Sep 28–Oct 3"
export function shortRange(a: string, b: string) {
  const A = new Date(a), B = new Date(b);
  const mA = A.toLocaleDateString('en-US', { month: 'short' }), mB = B.toLocaleDateString('en-US', { month: 'short' });
  if (a.slice(0, 10) === b.slice(0, 10)) return `${mA} ${A.getDate()}`;
  return mA === mB ? `${mA} ${A.getDate()}–${B.getDate()}` : `${mA} ${A.getDate()}–${mB} ${B.getDate()}`;
}

export function rowText(r: ChallengeRowData): { status: string; statusBrand: boolean; num: string; sub: string } {
  if (r.status === 'active') {
    if (r.starts_tomorrow) return { status: 'Starts tomorrow', statusBrand: false, num: 'Day 1', sub: `of ${r.duration_days}` };
    if (r.secured_today) return { status: 'Secured today', statusBrand: true, num: `Day ${r.day_n}`, sub: `of ${r.duration_days}` };
    return { status: `${plural(r.tasks_left_today, 'task')} left`, statusBrand: false, num: `Day ${r.day_n}`, sub: `of ${r.duration_days}` };
  }
  const x = `${r.secured_count} of ${r.days_in_run}`;
  const unit = r.days_in_run === 1 ? 'day' : 'days';
  if (r.status === 'abandoned') return { status: `Left on day ${r.left_on_day}`, statusBrand: false, num: x, sub: unit };
  if (r.status === 'failed') return { status: `Ended on day ${r.days_in_run}`, statusBrand: false, num: x, sub: unit };
  return { status: shortRange(r.start_at, r.end_at!), statusBrand: false, num: x, sub: unit };
}

// Sections: Running (active), Finished (completed + failed), Left (abandoned). Headers "{label} · {n}".

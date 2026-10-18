// 1.4 + 1.7 · result strings and input rules
export const mmss = (sec: number) => { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`; };
export const parseHms = (v: string) => { const p = v.split(':').map(Number); if (p.some(isNaN)) return null; return p.reduce((a, n) => a * 60 + n, 0); }; // h:mm:ss or mm:ss
export const pacePerMile = (mi: number, sec: number) => (mi > 0 ? sec / mi : 0);
export const PACE_MIN_SEC = 210; // 3:30 /mi
export const paceWarning = (mi: number, sec: number) => (mi > 0 && sec > 0 && pacePerMile(mi, sec) < PACE_MIN_SEC ? 'That pace looks off. Check the distance and time.' : null);
const fmtMi = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));
export function shortOfGoal(value: number, goal: number, unit: string) {
  if (value >= goal) return null;
  const gap = +(goal - value).toFixed(2);
  return { done: `${fmtMi(value)} of ${fmtMi(goal)} ${unit}`, short: `${fmtMi(gap)} ${unit} short`, note: `Today won’t count toward the ${fmtMi(goal)} ${unit} goal. The run is saved, the task stays open and today isn’t secured.` };
}
export function resultLine(c: any) {
  switch (c.type) {
    case 'run': { const s = shortOfGoal(c.distanceMi, c.goalMi, 'mi'); return { kind: 'Run', big: s ? s.done : `${fmtMi(c.distanceMi)} mi`, sub: `${mmss(c.durationSec)} · ${mmss(Math.round(pacePerMile(c.distanceMi, c.durationSec)))} /mi`, short: s?.short }; }
    case 'workout': return { kind: 'Workout', big: `${c.workoutType} · ${Math.round(c.durationSec / 60)} min` };
    case 'counter': return { kind: 'Counter', big: `${c.count} ${c.unit}` };
    case 'timer': return { kind: 'Timer', big: `${Math.round(c.durationSec / 60)} min` };
    case 'journal': return { kind: 'Journal', big: 'Journal entry', sub: 'The entry stays private.' }; // never the text
    default: return { kind: 'Photo', big: '' };
  }
}
export const verifyLabel = (c: any) => (c.source === 'strava' ? 'Verified by Strava' : c.source === 'camera' ? 'Verified' : 'Self-reported');
export const counterLine = (n: number, goal: number, unit: string) => ({ count: `${n} of ${goal} ${unit}`, reached: n >= goal, line: n >= goal ? 'Goal reached. Done saves it.' : `${goal - n} to go.` });
// + / − stay active past the goal. Nothing dims at the goal.

// Partial logs add up within the same local day; reset at local midnight. Pace is checked per log.
export const dayTotal = (logs: { value: number; localDate: string }[], today: string) => logs.filter((l) => l.localDate === today).reduce((a, l) => a + l.value, 0);
export const soFarLine = (total: number, goal: number, unit: string) => (total >= goal ? `${fmtMi(goal)} of ${fmtMi(goal)} ${unit}` : `${fmtMi(total)} of ${fmtMi(goal)} ${unit} so far`);

// 3.1 · Start here. Each card has its own Join; one tap joins and opens the first task. No radio buttons.
export type Pick = { id: string; name: string; does: string; category: string; people: number; windowStart?: string; windowEnd?: string; nextStartLabel?: string };
export function startHereList(all: Pick[], now: Date) {
  // never suggest a challenge whose task window already closed today, unless it's a goal match; then label it
  return all.map((c) => ({ ...c, startsTomorrow: !!c.windowEnd && closedToday(c.windowEnd, now) }));
}
const closedToday = (hhmm: string, now: Date) => { const [h, m] = hhmm.split(':').map(Number); return now.getHours() * 60 + now.getMinutes() > h * 60 + m; };
export const startsLabel = (time: string) => `Day 1 is tomorrow at ${time}`; // joining sets enrollment.started_on = tomorrow; today is never counted as missed
// Order: the first card is always one that can be finished today. Closed-window picks go after it (first only when nothing else matches).
export const orderPicks = <T extends { startsTomorrow: boolean }>(xs: T[]) => [...xs.filter((x) => !x.startsTomorrow), ...xs.filter((x) => x.startsTomorrow)];
export const FREEZE_LINE = 'Miss a day? A freeze covers it so your streak doesn’t break. You earn one every 7 days in a row.'; // once per screen
export async function join(id: string, api: any, router: any, toast: (m: string) => void) {
  const e = await api.post('/enrollments', { challenge_id: id }); // guest or signed in
  router.replace(`/task/${e.firstTaskId}`); toast('You’re in. Day 1 is today.');
}

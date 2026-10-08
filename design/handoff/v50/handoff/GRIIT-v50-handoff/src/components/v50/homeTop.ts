// v50 · HomeTop 2c (one card)
export const bestLabel = (current: number, best: number) => current >= best ? 'Your best' : `Best ${best.toLocaleString('en-US')}`;
export const streakNumeralSize = (n: number) => (n >= 1000 ? 30 : 32);
export type HomeAction = { kind: 'task'; taskId: string; label: string } | { kind: 'freeze' } | { kind: 'share' };
export function homeAction(o: { securedToday: boolean; yesterdayUnsecured: boolean; freezesLeft: number; nextTask?: { id: string; title: string } }): HomeAction {
  if (o.securedToday) return { kind: 'share' };
  if (o.yesterdayUnsecured && o.freezesLeft > 0) return { kind: 'freeze' };
  return { kind: 'task', taskId: o.nextTask!.id, label: o.nextTask!.title };
}

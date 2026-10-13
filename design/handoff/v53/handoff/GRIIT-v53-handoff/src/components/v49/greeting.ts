// v49 · HomeTop Option B
export function greeting(now: Date, displayName: string | null, username: string): string {
  const h = now.getHours();
  const name = (displayName?.trim().split(/\s+/)[0]) || '@' + username;
  if (h >= 4 && h < 12) return `Good morning, ${name}`;
  if (h >= 12 && h < 17) return `Good afternoon, ${name}`;
  if (h >= 17 && h < 22) return `Good evening, ${name}`;
  return `Still up, ${name}`;
}
export function greetingSub(o: { secured: boolean; nextTask?: string; openCount: number; firstWeekDay?: number }): string {
  if (o.firstWeekDay && o.firstWeekDay <= 7 && !o.secured) return `Day ${o.firstWeekDay} of your first week.`;
  if (o.secured) return 'Day secured. See you tomorrow.';
  if (o.openCount === 1 && o.nextTask) return `${o.nextTask} is all that’s left today.`;
  return `Next: ${o.nextTask}. ${o.openCount} tasks left today.`;
}

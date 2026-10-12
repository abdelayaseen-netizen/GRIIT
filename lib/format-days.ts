export const dayWord = (n: number) => (n === 1 ? "day" : "days");

export const challengeWord = (n: number) => (n === 1 ? "challenge" : "challenges");

export const taskWord = (n: number) => (n === 1 ? "task" : "tasks");

export function formatDays(n: number): string {
  return `${n} ${dayWord(n)}`;
}

export function formatTasks(n: number): string {
  return `${n} ${taskWord(n)}`;
}

export function formatOfDays(x: number, y: number): string {
  const denom = Math.max(0, Math.floor(y));
  const numer = Math.min(Math.max(0, Math.floor(x)), denom);
  return `${numer} of ${formatDays(denom)}`;
}

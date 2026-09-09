export const dayWord = (n: number) => (n === 1 ? "day" : "days");

export const challengeWord = (n: number) => (n === 1 ? "challenge" : "challenges");

export function formatDays(n: number): string {
  return `${n} ${dayWord(n)}`;
}

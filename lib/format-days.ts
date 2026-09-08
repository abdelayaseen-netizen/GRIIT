export const dayWord = (n: number) => (n === 1 ? "day" : "days");

export function formatDays(n: number): string {
  return `${n} ${dayWord(n)}`;
}

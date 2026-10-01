/** Counts under 10,000 in full with a comma; from 10,000, one decimal and K. */
export function compact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n < 10000) return n.toLocaleString("en-US");
  return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, "")}K`;
}

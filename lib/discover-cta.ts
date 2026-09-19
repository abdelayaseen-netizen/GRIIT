import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";

export const DISCOVER_CTA_TITLE = "Find another challenge";

export function discoverCtaSubtitle(args: {
  running: number;
  isPro: boolean;
  limit?: number;
}): string {
  const n = Math.max(0, Math.floor(args.running));
  const limit = args.limit ?? FREE_ACTIVE_CHALLENGES_LIMIT;
  if (n === 0) return "Nothing running.";
  if (args.isPro) return `${n} running.`;
  return `${n} of ${limit}. Free accounts hold ${limit} at a time.`;
}

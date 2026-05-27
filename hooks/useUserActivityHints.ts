/**
 * useUserActivityHints — derives the small set of hints the proposal engine needs
 * (days since last activity, has-completed-before, day-of-week, hour) without
 * adding any new tRPC procedures. Reads from existing queries.
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import type { ProposalInput } from "@/lib/create-proposal";

type SecuredKeysResult = string[];
type CompletedChallengesResult = unknown[];

function diffCalendarDays(latestDateKey: string, todayDateKey: string): number {
  const latest = new Date(`${latestDateKey}T00:00:00Z`);
  const today = new Date(`${todayDateKey}T00:00:00Z`);
  if (Number.isNaN(latest.getTime()) || Number.isNaN(today.getTime())) return 0;
  const ms = today.getTime() - latest.getTime();
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
}

function getLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type UseUserActivityHintsResult = {
  hints: ProposalInput;
  isLoading: boolean;
};

export function useUserActivityHints(): UseUserActivityHintsResult {
  const securedKeysQuery = useQuery<SecuredKeysResult>({
    queryKey: ["profile", "securedDateKeys"],
    queryFn: () => trpcQuery<SecuredKeysResult>(TRPC.profiles.getSecuredDateKeys),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const completedQuery = useQuery<CompletedChallengesResult>({
    queryKey: ["profile", "completedChallenges"],
    queryFn: () => trpcQuery<CompletedChallengesResult>(TRPC.profiles.getCompletedChallenges),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const securedKeys = securedKeysQuery.data ?? [];
  const latestKey = securedKeys.length > 0 ? securedKeys[0] : null;
  const todayKey = getLocalDateKey(now);

  const daysSinceLastActivity =
    typeof latestKey === "string" && latestKey.length > 0
      ? diffCalendarDays(latestKey, todayKey)
      : null;

  const hasCompletedChallengeBefore = (completedQuery.data ?? []).length > 0;

  const hints: ProposalInput = {
    daysSinceLastActivity,
    hasCompletedChallengeBefore,
    dayOfWeek: now.getDay(),
    hourOfDay: now.getHours(),
  };

  return {
    hints,
    isLoading: securedKeysQuery.isLoading || completedQuery.isLoading,
  };
}

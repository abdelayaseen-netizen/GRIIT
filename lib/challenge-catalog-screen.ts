/**
 * Catalog detail (app/challenge/[id].tsx) reads the challenges row.
 * Enrollment / participant history must not gate title or tasks.
 */
import { PRIVATE_CHALLENGE_MESSAGE } from "@/backend/lib/can-view-challenge";
import { toDetailTasks, type ChallengeDetailTask, type DetailTask } from "@/lib/challenge-detail-mapping";

export { PRIVATE_CHALLENGE_MESSAGE };

export function catalogScreenPrivate(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : "";
  return msg.includes(PRIVATE_CHALLENGE_MESSAGE);
}

export type CatalogChallengeRow = {
  title?: string | null;
  description?: string | null;
  tasks?: DetailTask[] | null;
  challenge_tasks?: DetailTask[] | null;
};

export type CatalogQueryState = {
  isLoading: boolean;
  isError: boolean;
};

export function catalogTitle(challenge: CatalogChallengeRow | null | undefined): string {
  return challenge?.title?.trim() || "Challenge";
}

export function catalogTasks(challenge: CatalogChallengeRow | null | undefined): ChallengeDetailTask[] {
  const raw = (challenge?.tasks ?? challenge?.challenge_tasks ?? []) as DetailTask[];
  return toDetailTasks(raw);
}

/** Skeleton only while the challenges row is in flight and missing. Never enrollment. */
export function catalogScreenLoading(
  challenge: CatalogChallengeRow | null | undefined,
  query: CatalogQueryState,
): boolean {
  return query.isLoading && !challenge;
}

/** EmptyState + Retry when the challenges query failed or settled empty. */
export function catalogScreenError(
  challenge: CatalogChallengeRow | null | undefined,
  query: CatalogQueryState,
): boolean {
  if (catalogScreenLoading(challenge, query)) return false;
  return query.isError || (!query.isLoading && !challenge);
}

export function catalogFromChallengeRow(
  challenge: CatalogChallengeRow | null | undefined,
  query: CatalogQueryState,
  _enrollments?: unknown[] | null,
  _participants?: unknown[] | null,
): {
  title: string;
  tasks: ChallengeDetailTask[];
  loading: boolean;
  error: boolean;
} {
  return {
    title: catalogTitle(challenge),
    tasks: catalogTasks(challenge),
    loading: catalogScreenLoading(challenge, query),
    error: catalogScreenError(challenge, query),
  };
}

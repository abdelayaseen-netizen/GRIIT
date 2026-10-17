import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  firstTaskHrefFromJoin,
  joinHasEnrollment,
  type JoinFirstTask,
  type JoinWithFirstTask,
} from "@/lib/open-first-task";

type ChallengeDetailForJoin = {
  title?: string | null;
  duration_days?: number | null;
  challenge_tasks?: JoinFirstTask[] | null;
  tasks?: JoinFirstTask[] | null;
};

/** When the server has not yet shipped first_task, load it from getById. */
export async function enrichJoinWithFirstTask(
  result: JoinWithFirstTask | null | undefined,
  challengeId: string,
): Promise<JoinWithFirstTask | null> {
  if (!result || !joinHasEnrollment(result)) return result ?? null;
  if (result.first_task?.id) return result;
  try {
    const detail = (await trpcQuery(TRPC.challenges.getById, {
      id: challengeId,
    })) as ChallengeDetailForJoin | null;
    const list = detail?.challenge_tasks ?? detail?.tasks ?? [];
    const head = list[0];
    if (!head?.id) return result;
    const cfg =
      head.config && typeof head.config === "object" ? head.config : null;
    const nested =
      cfg && typeof (cfg as { duration_minutes?: unknown }).duration_minutes === "number"
        ? (cfg as { duration_minutes: number }).duration_minutes
        : null;
    return {
      ...result,
      challenge_id: result.challenge_id ?? challengeId,
      challenge_title: result.challenge_title ?? detail?.title ?? null,
      duration_days: result.duration_days ?? detail?.duration_days ?? null,
      first_task: {
        id: head.id,
        title: head.title ?? null,
        task_type: head.task_type ?? null,
        config: cfg,
        require_photo: head.require_photo ?? null,
        min_duration_minutes: head.min_duration_minutes ?? nested,
        duration_minutes: head.duration_minutes ?? head.min_duration_minutes ?? nested,
      },
    };
  } catch {
    return result;
  }
}

export async function firstTaskHrefAfterJoin(
  result: JoinWithFirstTask | null | undefined,
  challengeId: string,
  originTab: string = "home",
): Promise<string | null> {
  const enriched = await enrichJoinWithFirstTask(result, challengeId);
  return firstTaskHrefFromJoin(enriched, originTab);
}

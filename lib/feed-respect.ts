/**
 * Live-feed respect toggle: optimistic, settle from the server, rollback on failure.
 */

export type RespectState = {
  reactedByMe: boolean;
  respectCount: number;
};

export function optimisticRespect(prev: RespectState): RespectState {
  return {
    reactedByMe: !prev.reactedByMe,
    respectCount: Math.max(0, prev.respectCount + (prev.reactedByMe ? -1 : 1)),
  };
}

export function settleRespect(
  result: { reacted?: boolean; reactionCount?: number },
  optimistic: RespectState,
): RespectState {
  return {
    reactedByMe: !!result.reacted,
    respectCount: Math.max(0, result.reactionCount ?? optimistic.respectCount),
  };
}

export function rollbackRespect(prev: RespectState): RespectState {
  return { reactedByMe: prev.reactedByMe, respectCount: prev.respectCount };
}

/**
 * Move a guest's enrollment, task completions, and proofs onto an existing account,
 * then delete the anonymous user. Same challenge: keep the existing enrollment and
 * hang the guest's completions on it.
 */

export type GuestEnrollment = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
};

export type GuestCheckIn = {
  id: string;
  user_id: string;
  active_challenge_id: string;
  task_id: string;
  date_key: string;
  status: string;
  proof_url: string | null;
  photo_url: string | null;
  completion_image_url: string | null;
};

export type GuestEvent = {
  id: string;
  user_id: string;
  metadata: Record<string, unknown> | null;
};

export type GuestDaySecure = {
  id: string;
  user_id: string;
  date_key: string;
};

export type GuestMergeState = {
  enrollments: GuestEnrollment[];
  checkIns: GuestCheckIn[];
  events: GuestEvent[];
  daySecures: GuestDaySecure[];
  storagePaths: string[];
  deletedUserIds: string[];
};

function rewriteProof(value: string | null, fromUserId: string, toUserId: string): string | null {
  if (!value) return value;
  const fromPrefix = `${fromUserId}/`;
  const toPrefix = `${toUserId}/`;
  if (value.startsWith(fromPrefix)) return toPrefix + value.slice(fromPrefix.length);
  const fromSlash = `/${fromPrefix}`;
  const toSlash = `/${toPrefix}`;
  if (value.includes(fromSlash)) return value.split(fromSlash).join(toSlash);
  return value;
}

function rewriteMeta(
  metadata: Record<string, unknown> | null,
  fromUserId: string,
  toUserId: string,
): Record<string, unknown> | null {
  if (!metadata) return metadata;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    next[key] = typeof value === "string" ? rewriteProof(value, fromUserId, toUserId) : value;
  }
  return next;
}

export function applyGuestMerge(
  state: GuestMergeState,
  fromUserId: string,
  toUserId: string,
): GuestMergeState {
  if (!fromUserId || fromUserId === toUserId) return state;

  const enrollments = state.enrollments.map((row) => ({ ...row }));
  const checkIns = state.checkIns.map((row) => ({ ...row }));
  const events = state.events.map((row) => ({
    ...row,
    metadata: row.metadata ? { ...row.metadata } : null,
  }));
  const daySecures = state.daySecures.map((row) => ({ ...row }));
  let storagePaths = state.storagePaths.slice();

  const enrollmentMap = new Map<string, string>();
  const dropEnrollments = new Set<string>();

  for (const guest of enrollments) {
    if (guest.user_id !== fromUserId) continue;
    const dest = enrollments.find(
      (row) =>
        row.user_id === toUserId &&
        row.challenge_id === guest.challenge_id &&
        row.status === "active" &&
        guest.status === "active",
    );
    if (dest) {
      enrollmentMap.set(guest.id, dest.id);
      dropEnrollments.add(guest.id);
    } else {
      guest.user_id = toUserId;
      enrollmentMap.set(guest.id, guest.id);
    }
  }

  const dropCheckIns = new Set<string>();
  for (const guest of checkIns) {
    if (guest.user_id !== fromUserId) continue;
    const activeChallengeId = enrollmentMap.get(guest.active_challenge_id) ?? guest.active_challenge_id;
    const clash = checkIns.find(
      (row) =>
        row.id !== guest.id &&
        !dropCheckIns.has(row.id) &&
        row.user_id === toUserId &&
        row.active_challenge_id === activeChallengeId &&
        row.task_id === guest.task_id &&
        row.date_key === guest.date_key,
    );
    const proof_url = rewriteProof(guest.proof_url, fromUserId, toUserId);
    const photo_url = rewriteProof(guest.photo_url, fromUserId, toUserId);
    const completion_image_url = rewriteProof(guest.completion_image_url, fromUserId, toUserId);
    if (clash) {
      if (guest.status === "completed" && clash.status !== "completed") {
        clash.status = guest.status;
        clash.proof_url = proof_url;
        clash.photo_url = photo_url;
        clash.completion_image_url = completion_image_url;
      }
      dropCheckIns.add(guest.id);
      continue;
    }
    guest.user_id = toUserId;
    guest.active_challenge_id = activeChallengeId;
    guest.proof_url = proof_url;
    guest.photo_url = photo_url;
    guest.completion_image_url = completion_image_url;
  }

  for (const event of events) {
    if (event.user_id !== fromUserId) continue;
    event.user_id = toUserId;
    event.metadata = rewriteMeta(event.metadata, fromUserId, toUserId);
  }

  const dropDays = new Set<string>();
  for (const day of daySecures) {
    if (day.user_id !== fromUserId) continue;
    const clash = daySecures.find(
      (row) => row.id !== day.id && row.user_id === toUserId && row.date_key === day.date_key,
    );
    if (clash) {
      dropDays.add(day.id);
      continue;
    }
    day.user_id = toUserId;
  }

  storagePaths = storagePaths.map((path) => rewriteProof(path, fromUserId, toUserId) ?? path);

  return {
    enrollments: enrollments.filter((row) => !dropEnrollments.has(row.id)),
    checkIns: checkIns.filter((row) => !dropCheckIns.has(row.id)),
    events,
    daySecures: daySecures.filter((row) => !dropDays.has(row.id)),
    storagePaths,
    deletedUserIds: [...state.deletedUserIds, fromUserId],
  };
}

export type GuestMergeWrite =
  | { op: "update"; table: string; id: string; patch: Record<string, unknown> }
  | { op: "delete"; table: string; id: string }
  | { op: "move_storage"; from: string; to: string }
  | { op: "delete_user"; userId: string };

export function guestMergeWrites(before: GuestMergeState, after: GuestMergeState): GuestMergeWrite[] {
  const writes: GuestMergeWrite[] = [];
  const beforeEnrollment = new Map(before.enrollments.map((row) => [row.id, row]));
  const afterEnrollment = new Map(after.enrollments.map((row) => [row.id, row]));
  for (const [id, row] of beforeEnrollment) {
    if (!afterEnrollment.has(id)) writes.push({ op: "delete", table: "active_challenges", id });
    else if (afterEnrollment.get(id)?.user_id !== row.user_id) {
      writes.push({ op: "update", table: "active_challenges", id, patch: { user_id: afterEnrollment.get(id)!.user_id } });
    }
  }
  const beforeCheck = new Map(before.checkIns.map((row) => [row.id, row]));
  const afterCheck = new Map(after.checkIns.map((row) => [row.id, row]));
  for (const [id, row] of beforeCheck) {
    const next = afterCheck.get(id);
    if (!next) {
      writes.push({ op: "delete", table: "check_ins", id });
      continue;
    }
    if (
      next.user_id !== row.user_id ||
      next.active_challenge_id !== row.active_challenge_id ||
      next.proof_url !== row.proof_url ||
      next.photo_url !== row.photo_url ||
      next.completion_image_url !== row.completion_image_url ||
      next.status !== row.status
    ) {
      writes.push({
        op: "update",
        table: "check_ins",
        id,
        patch: {
          user_id: next.user_id,
          active_challenge_id: next.active_challenge_id,
          status: next.status,
          proof_url: next.proof_url,
          photo_url: next.photo_url,
          completion_image_url: next.completion_image_url,
        },
      });
    }
  }
  const beforeEvent = new Map(before.events.map((row) => [row.id, row]));
  for (const row of after.events) {
    const prev = beforeEvent.get(row.id);
    if (!prev) continue;
    if (prev.user_id !== row.user_id || JSON.stringify(prev.metadata) !== JSON.stringify(row.metadata)) {
      writes.push({ op: "update", table: "activity_events", id: row.id, patch: { user_id: row.user_id, metadata: row.metadata } });
    }
  }
  const beforeDay = new Map(before.daySecures.map((row) => [row.id, row]));
  const afterDay = new Map(after.daySecures.map((row) => [row.id, row]));
  for (const [id, row] of beforeDay) {
    const next = afterDay.get(id);
    if (!next) writes.push({ op: "delete", table: "day_secures", id });
    else if (next.user_id !== row.user_id) {
      writes.push({ op: "update", table: "day_secures", id, patch: { user_id: next.user_id } });
    }
  }
  for (let i = 0; i < before.storagePaths.length; i += 1) {
    const from = before.storagePaths[i];
    const to = after.storagePaths[i];
    if (from && to && from !== to) writes.push({ op: "move_storage", from, to });
  }
  for (const userId of after.deletedUserIds) {
    if (!before.deletedUserIds.includes(userId)) writes.push({ op: "delete_user", userId });
  }
  return writes;
}

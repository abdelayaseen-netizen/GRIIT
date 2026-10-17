import {
  applyGuestMerge,
  guestMergeWrites,
  type GuestCheckIn,
  type GuestDaySecure,
  type GuestEnrollment,
  type GuestEvent,
  type GuestMergeState,
  type GuestMergeWrite,
} from "./guest-merge";

type Rows = { data: unknown[] | null; error: { message?: string } | null };
type Write = { error: { message?: string } | null };

export type GuestMergeAdmin = {
  from: (table: string) => {
    select: (columns: string) => { eq: (column: string, value: string) => Promise<Rows> };
    update: (patch: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<Write> };
    delete: () => { eq: (column: string, value: string) => Promise<Write> };
  };
  storage: {
    from: (bucket: string) => {
      list: (prefix: string) => Promise<{ data: { name: string }[] | null; error: { message?: string } | null }>;
      move: (from: string, to: string) => Promise<Write>;
    };
  };
  auth: {
    admin: {
      deleteUser: (userId: string) => Promise<Write>;
    };
  };
};

async function rowsFor(admin: GuestMergeAdmin, table: string, userId: string): Promise<unknown[]> {
  const result = await admin.from(table).select("*").eq("user_id", userId);
  if (result.error) throw new Error(result.error.message || `Could not read ${table}.`);
  return result.data ?? [];
}

function asEnrollments(rows: unknown[]): GuestEnrollment[] {
  return rows.map((row) => {
    const item = row as GuestEnrollment;
    return { id: item.id, user_id: item.user_id, challenge_id: item.challenge_id, status: item.status };
  });
}

function asCheckIns(rows: unknown[]): GuestCheckIn[] {
  return rows.map((row) => {
    const item = row as GuestCheckIn;
    return {
      id: item.id,
      user_id: item.user_id,
      active_challenge_id: item.active_challenge_id,
      task_id: item.task_id,
      date_key: item.date_key,
      status: item.status,
      proof_url: item.proof_url ?? null,
      photo_url: item.photo_url ?? null,
      completion_image_url: item.completion_image_url ?? null,
    };
  });
}

function asEvents(rows: unknown[]): GuestEvent[] {
  return rows.map((row) => {
    const item = row as GuestEvent;
    return { id: item.id, user_id: item.user_id, metadata: item.metadata ?? null };
  });
}

function asDays(rows: unknown[]): GuestDaySecure[] {
  return rows.map((row) => {
    const item = row as GuestDaySecure;
    return { id: item.id, user_id: item.user_id, date_key: item.date_key };
  });
}

export async function loadGuestMergeState(admin: GuestMergeAdmin, fromUserId: string, toUserId: string): Promise<GuestMergeState> {
  const [guestEnrollments, destEnrollments, guestCheckIns, destCheckIns, guestEvents, destEvents, guestDays, destDays, listed] =
    await Promise.all([
      rowsFor(admin, "active_challenges", fromUserId),
      rowsFor(admin, "active_challenges", toUserId),
      rowsFor(admin, "check_ins", fromUserId),
      rowsFor(admin, "check_ins", toUserId),
      rowsFor(admin, "activity_events", fromUserId),
      rowsFor(admin, "activity_events", toUserId),
      rowsFor(admin, "day_secures", fromUserId),
      rowsFor(admin, "day_secures", toUserId),
      admin.storage.from("task-proofs").list(fromUserId),
    ]);
  if (listed.error) throw new Error(listed.error.message || "Could not list proofs.");
  return {
    enrollments: [...asEnrollments(guestEnrollments), ...asEnrollments(destEnrollments)],
    checkIns: [...asCheckIns(guestCheckIns), ...asCheckIns(destCheckIns)],
    events: [...asEvents(guestEvents), ...asEvents(destEvents)],
    daySecures: [...asDays(guestDays), ...asDays(destDays)],
    storagePaths: (listed.data ?? []).map((file) => `${fromUserId}/${file.name}`),
    deletedUserIds: [],
  };
}

export async function executeGuestMergeWrites(admin: GuestMergeAdmin, writes: GuestMergeWrite[]): Promise<void> {
  for (const write of writes) {
    if (write.op === "update") {
      const result = await admin.from(write.table).update(write.patch).eq("id", write.id);
      if (result.error) throw new Error(result.error.message || `Could not update ${write.table}.`);
    } else if (write.op === "delete") {
      const result = await admin.from(write.table).delete().eq("id", write.id);
      if (result.error) throw new Error(result.error.message || `Could not delete ${write.table}.`);
    } else if (write.op === "move_storage") {
      const result = await admin.storage.from("task-proofs").move(write.from, write.to);
      if (result.error) throw new Error(result.error.message || "Could not move a proof.");
    } else {
      const result = await admin.auth.admin.deleteUser(write.userId);
      if (result.error) throw new Error(result.error.message || "Could not delete the guest user.");
    }
  }
}

export async function persistGuestMerge(admin: GuestMergeAdmin, fromUserId: string, toUserId: string): Promise<void> {
  const before = await loadGuestMergeState(admin, fromUserId, toUserId);
  const after = applyGuestMerge(before, fromUserId, toUserId);
  await executeGuestMergeWrites(admin, guestMergeWrites(before, after));
}

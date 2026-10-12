import { logger } from "./logger";
import {
  ANONYMIZE_CREATOR,
  DELETE_EITHER_SIDE,
  DELETE_STORAGE_BUCKETS,
  DELETE_USER_ROWS,
} from "./delete-account-plan";

type WriteResult = { error: { message?: string } | null };

type AdminLike = {
  from: (table: string) => {
    delete: () => { eq: (column: string, value: string) => PromiseLike<WriteResult> };
    update: (patch: Record<string, unknown>) => {
      eq: (column: string, value: string) => PromiseLike<WriteResult>;
    };
  };
  storage: {
    from: (bucket: string) => {
      list: (prefix: string) => PromiseLike<{ data: { name: string }[] | null; error: { message?: string } | null }>;
      remove: (paths: string[]) => PromiseLike<WriteResult>;
    };
  };
  auth: { admin: { deleteUser: (userId: string) => PromiseLike<WriteResult> } };
};

async function ignore(label: string, result: WriteResult): Promise<void> {
  if (result.error) logger.warn({ label, message: result.error.message }, "[deleteAccount] step failed");
}

/** Best-effort. A missing table does not stop the auth user from being deleted. */
export async function eraseUserData(admin: AdminLike, userId: string): Promise<void> {
  for (const row of DELETE_USER_ROWS) {
    await ignore(row.table, await admin.from(row.table).delete().eq(row.column, userId));
  }
  for (const row of DELETE_EITHER_SIDE) {
    for (const column of row.columns) {
      await ignore(row.table, await admin.from(row.table).delete().eq(column, userId));
    }
  }
  await ignore(
    ANONYMIZE_CREATOR.table,
    await admin.from(ANONYMIZE_CREATOR.table).update({ creator_id: null }).eq(ANONYMIZE_CREATOR.column, userId)
  );
  for (const bucket of DELETE_STORAGE_BUCKETS) {
    const listed = await admin.storage.from(bucket).list(userId);
    const names = (listed.data ?? []).map((file) => `${userId}/${file.name}`);
    if (names.length > 0) await ignore(bucket, await admin.storage.from(bucket).remove(names));
  }
  await ignore("profiles", await admin.from("profiles").delete().eq("user_id", userId));
  await ignore("auth.users", await admin.auth.admin.deleteUser(userId));
}

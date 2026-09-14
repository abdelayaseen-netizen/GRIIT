import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import type { ProfileFromApi } from "@/types";

export type ProfileReadState =
  | { status: "ready"; profile: ProfileFromApi }
  | { status: "error"; error: unknown };

/** One profiles.get. Null or throw → error. Caller must not refetch on error. */
export async function readOwnProfileOnce(): Promise<ProfileReadState> {
  try {
    const data = await trpcQuery<ProfileFromApi | null>(TRPC.profiles.get);
    if (!data) {
      return { status: "error", error: Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" }) };
    }
    return { status: "ready", profile: data };
  } catch (error) {
    return { status: "error", error };
  }
}

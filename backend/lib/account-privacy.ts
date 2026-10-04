import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canSeeProfileContent,
  type PrivacyProfileFields,
} from "../../lib/profile-privacy";
import { isFriend, sharesChallenge } from "./is-friend";

export const ACCOUNT_PRIVACY_SELECT =
  "user_id, profile_visibility, challenge_visibility, activity_visibility";

export async function canViewerSeeAccountContent(
  db: SupabaseClient,
  viewerId: string | null | undefined,
  ownerId: string,
): Promise<boolean> {
  if (viewerId && viewerId === ownerId) return true;
  const { data } = await db.from("profiles").select(ACCOUNT_PRIVACY_SELECT).eq("user_id", ownerId).maybeSingle();
  if (!data) return false;
  const isMutual = viewerId ? await isFriend(db, viewerId, ownerId) : false;
  const isCoMember = viewerId ? await sharesChallenge(db, viewerId, ownerId) : false;
  return canSeeProfileContent(viewerId, data as PrivacyProfileFields, { isMutual, isCoMember });
}

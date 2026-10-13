export type PostAudience = "friends" | "everyone" | "only_me";

export const POST_AUDIENCES: PostAudience[] = ["friends", "everyone", "only_me"];

export function postButtonLabel(audience: PostAudience): string {
  if (audience === "everyone") return "Post to everyone";
  if (audience === "only_me") return "Save privately";
  return "Post to friends";
}

export function audienceBadge(audience: string | null | undefined): string | null {
  if (audience === "friends" || audience === "everyone" || audience === "only_me") return audienceLabel(audience);
  return null;
}

export function audienceLabel(audience: PostAudience): string {
  if (audience === "everyone") return "Everyone";
  if (audience === "only_me") return "Only me";
  return "Friends";
}

/** Only me stays off the feed (kept). Friends and Everyone are shared, then the feed scope splits them. */
export function shareStateForAudience(audience: PostAudience): "shared" | "kept" {
  return audience === "only_me" ? "kept" : "shared";
}

export function audienceShowsInScope(
  audience: string | null | undefined,
  scope: "following" | "everyone",
): boolean {
  if (audience === "only_me") return false;
  if (scope === "everyone" && audience === "friends") return false;
  return true;
}

export function canSeePostAudience(args: {
  audience: string | null | undefined;
  viewerId: string;
  authorId: string;
  isFriend: boolean;
}): boolean {
  if (args.viewerId === args.authorId) return true;
  if (args.audience === "only_me") return false;
  if (args.audience === "friends") return args.isFriend;
  return true;
}

/** Profile grid: shared posts the viewer may see, plus the author's own Only me posts. */
export function profilePostVisible(args: {
  shareState: string | null | undefined;
  audience: string | null | undefined;
  viewerId: string;
  authorId: string;
  isFriend: boolean;
}): boolean {
  if (args.shareState === "shared") {
    return canSeePostAudience(args);
  }
  return args.viewerId === args.authorId && args.audience === "only_me";
}

/** A self-reported completion with no photo is a private check-in, not a post. */
export function createsActivityPost(selfReported: boolean, hasPhoto: boolean): boolean {
  if (selfReported && !hasPhoto) return false;
  return true;
}

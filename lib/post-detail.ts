import type { StampLabel } from "@/components/ds/Stamp";
import { hasCameraProof } from "@/lib/active-challenge-ui";

export const POST_DETAIL_TITLE = "Proof";
export const COMMENTS_HEADING = "Comments";
export const COMMENT_PLACEHOLDER = "Add a comment";
export const COMMENTS_EMPTY = "No comments yet.";

export function commentsCountLabel(n: number): string {
  return `${n} comments`;
}

export function completionLine(input: {
  author: string;
  task: string;
  challenge: string;
}): string {
  return `${input.author} · ${input.task} · ${input.challenge}`;
}

export function postDetailPhotoUri(post: {
  proofPhotoUrl?: string | null;
  photoUrl?: string | null;
}): string | null {
  const uri = (post.proofPhotoUrl || post.photoUrl || "").trim();
  return uri.length > 0 ? uri : null;
}

/** Stamp only when the completion returned camera proof — never require_photo. */
export function postDetailStamp(post: {
  proofPhotoUrl?: string | null;
  photoUrl?: string | null;
  hasProof?: boolean;
}): StampLabel | undefined {
  return hasCameraProof({
    proof_photo_url: post.proofPhotoUrl || (post.hasProof ? post.photoUrl : null) || null,
  })
    ? "Verified"
    : undefined;
}

export function sendComposerArmed(text: string): boolean {
  return text.trim().length > 0;
}

/** Sheet field is canvas on surface; route field is surface on canvas. */
export function composerFieldGround(surface: "sheet" | "route"): "canvas" | "surface" {
  return surface === "sheet" ? "canvas" : "surface";
}

export function postDetailLoading(args: {
  postPending: boolean;
  hasPost: boolean;
}): boolean {
  return args.postPending && !args.hasPost;
}

export function commentsSectionKind(
  commentsPending: boolean,
  count: number,
): "loading" | "empty" | "list" {
  if (commentsPending && count === 0) return "loading";
  if (count === 0) return "empty";
  return "list";
}

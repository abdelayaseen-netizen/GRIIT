/** Hard mode always requires photo proof. Client state must match the server. */

export type WizardDifficulty = "standard" | "hard";
export type WizardPhotoProof = "off" | "optional" | "required";

export const HARD_MODE_PROOF_CAPTION = "Hard mode requires photo proof on every task.";
export const HARD_MODE_REVIEW_PHOTO = "Feed · Required";

export function effectivePhotoProof(
  difficulty: WizardDifficulty,
  photoProof: WizardPhotoProof,
): WizardPhotoProof {
  return difficulty === "hard" ? "required" : photoProof;
}

export function reviewPhotoLine(
  difficulty: WizardDifficulty,
  photoProof: WizardPhotoProof,
): string {
  if (difficulty === "hard") return HARD_MODE_REVIEW_PHOTO;
  if (photoProof === "off") return "Feed · Off";
  if (photoProof === "required") return "Feed · Required";
  return "Feed · Optional";
}

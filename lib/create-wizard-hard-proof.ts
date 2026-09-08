/** Hard mode always requires photo proof. Client state must match the server. */

export type WizardDifficulty = "standard" | "hard";
export type WizardPhotoProof = "off" | "optional" | "required";

export const HARD_MODE_PROOF_CAPTION = "Hard mode requires photo proof on every task.";
export const HARD_MODE_REVIEW_PHOTO = "Photo proof required · Hard mode";

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
  if (photoProof === "off") return "Photo proof off";
  if (photoProof === "required") return "Photo proof required";
  return "Photo proof optional";
}

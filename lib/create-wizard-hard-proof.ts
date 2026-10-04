/** Strictness and photo mode are independent. Hard mode does not force a photo. */

export type WizardDifficulty = "standard" | "hard";
export type WizardPhotoProof = "off" | "optional" | "required";

export function effectivePhotoProof(
  _difficulty: WizardDifficulty,
  photoProof: WizardPhotoProof,
): WizardPhotoProof {
  return photoProof;
}

export function reviewPhotoLine(
  _difficulty: WizardDifficulty,
  photoProof: WizardPhotoProof,
): string {
  if (photoProof === "off") return "Feed · Off";
  if (photoProof === "required") return "Feed · Required";
  return "Feed · Optional";
}

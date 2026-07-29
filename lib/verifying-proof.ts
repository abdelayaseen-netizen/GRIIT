/**
 * Pure helpers for VerifyingProof row visibility.
 * Rows animate in only when the backend has confirmed pass/fail.
 */

export type VerifyingProofRow = {
  label: string;
  verified: boolean | null | undefined;
};

/** Rows ready to reveal — pending (null/undefined) stay hidden. */
export function visibleVerifyingRows(
  rows: VerifyingProofRow[]
): VerifyingProofRow[] {
  return rows.filter((r) => r.verified === true || r.verified === false);
}

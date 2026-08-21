/**
 * Pure helpers for VerifyingProof row visibility.
 * Rows animate in only when `verified` is a boolean (checks and records).
 */

export type VerificationRowRole = "check" | "record";

export type VerifyingProofRow = {
  label: string;
  verified: boolean | null | undefined;
  /** Omitted on pending rows. Server sends this; mappers must copy it. */
  role?: VerificationRowRole;
};

/** Shape returned by checkins.complete verification.rows. */
export type ServerVerificationRow = {
  key?: string;
  label: string;
  verified: boolean;
  role?: VerificationRowRole;
};

/** Copy label, verified, and role — do not strip role. */
export function mapServerVerificationRows(
  rows: ServerVerificationRow[] | undefined
): VerifyingProofRow[] {
  return (rows ?? []).map((r) => ({
    label: r.label,
    verified: r.verified,
    role: r.role,
  }));
}

/** Rows ready to reveal — pending (null/undefined) stay hidden. Records are boolean. */
export function visibleVerifyingRows(
  rows: VerifyingProofRow[]
): VerifyingProofRow[] {
  return rows.filter((r) => r.verified === true || r.verified === false);
}

/**
 * Camera-proof predicate for check_ins / completion rows.
 * Mirrors `hasCameraProof` in lib/active-challenge-ui.ts:
 *   verified === true || Boolean(proof_photo_url)
 * Never require_photo. URL pick matches app/challenge/active proofUrl.
 */

export function hasCameraProof(row: {
  verified?: boolean | null;
  proof_photo_url?: string | null;
}): boolean {
  return row.verified === true || Boolean(row.proof_photo_url);
}

/** Same pick as `proofUrl` in app/challenge/active/[activeChallengeId].tsx. */
export function proofPhotoUrlFromCheckIn(row: {
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
}): string | null {
  const u = row.photo_url || row.proof_url || row.completion_image_url;
  return typeof u === "string" && u.trim() ? u.trim() : null;
}

export type ProofCheckIn = {
  date_key: string;
  active_challenge_id?: string | null;
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  verified?: boolean | null;
  proof_photo_url?: string | null;
};

export function checkInHasCameraProof(row: ProofCheckIn): boolean {
  return hasCameraProof({
    verified: row.verified,
    proof_photo_url: row.proof_photo_url ?? proofPhotoUrlFromCheckIn(row),
  });
}

export type EnrollmentProofSplit = {
  id: string;
  camera: number;
  selfReported: number;
};

export type SecuredProofSplit = {
  cameraDays: number;
  selfReportedDays: number;
  byEnrollment: EnrollmentProofSplit[];
};

/** A secured day is camera if any check-in that day has camera proof. */
export function splitSecuredProof(args: {
  securedDateKeys: string[];
  checkIns: ProofCheckIn[];
  enrollmentIds: string[];
}): SecuredProofSplit {
  const secured = new Set(args.securedDateKeys);
  const byDay = new Map<string, ProofCheckIn[]>();
  for (const row of args.checkIns) {
    if (!secured.has(row.date_key)) continue;
    const list = byDay.get(row.date_key) ?? [];
    list.push(row);
    byDay.set(row.date_key, list);
  }

  let cameraDays = 0;
  for (const key of args.securedDateKeys) {
    const rows = byDay.get(key) ?? [];
    if (rows.some(checkInHasCameraProof)) cameraDays += 1;
  }

  const byEnrollment = args.enrollmentIds.map((id) => {
    const days = new Set<string>();
    for (const row of args.checkIns) {
      if (row.active_challenge_id === id && secured.has(row.date_key)) {
        days.add(row.date_key);
      }
    }
    let camera = 0;
    for (const key of days) {
      const rows = (byDay.get(key) ?? []).filter((r) => r.active_challenge_id === id);
      if (rows.some(checkInHasCameraProof)) camera += 1;
    }
    return { id, camera, selfReported: days.size - camera };
  });

  return {
    cameraDays,
    selfReportedDays: args.securedDateKeys.length - cameraDays,
    byEnrollment,
  };
}

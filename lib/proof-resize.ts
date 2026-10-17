/** Long edge for a proof upload. JPEG 0.7 at this size stays under 400 KB. */
export const PROOF_LONG_EDGE = 1080;
export const PROOF_JPEG_QUALITY = 0.7;

export function proofLongEdgeSize(
  width: number,
  height: number,
  longEdge = PROOF_LONG_EDGE,
): { width: number; height: number } {
  const w = Math.max(0, Math.round(width));
  const h = Math.max(0, Math.round(height));
  if (w === 0 || h === 0) return { width: w, height: h };
  const edge = Math.max(w, h);
  if (edge <= longEdge) return { width: w, height: h };
  const scale = longEdge / edge;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

export type ProofManipulate = (
  uri: string,
  actions: { resize: { width: number; height: number } }[],
  options: { compress: number; format: "jpeg" },
) => Promise<{ uri: string }>;

export async function shrinkProofForUpload(args: {
  uri: string;
  width: number;
  height: number;
  manipulate: ProofManipulate;
}): Promise<{ uri: string; width: number; height: number }> {
  const size = proofLongEdgeSize(args.width, args.height);
  const out = await args.manipulate(args.uri, [{ resize: size }], {
    compress: PROOF_JPEG_QUALITY,
    format: "jpeg",
  });
  return { uri: out.uri, width: size.width, height: size.height };
}

/** Shrink, then hand the resized file uri to the uploader. */
export async function deliverResizedProof(args: {
  uri: string;
  width: number;
  height: number;
  manipulate: ProofManipulate;
  upload: (uri: string) => Promise<{ url: string } | { error: string }>;
}): Promise<{ url: string } | { error: string }> {
  const shrunk = await shrinkProofForUpload(args);
  return args.upload(shrunk.uri);
}

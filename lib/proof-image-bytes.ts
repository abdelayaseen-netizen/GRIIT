/** 19 Sept stubs were 1401-byte JFIFs (same eTag, black tiles). */
export const MIN_PROOF_IMAGE_BYTES = 8 * 1024;

export function isPersistedProofImage(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < MIN_PROOF_IMAGE_BYTES) return false;
  const u = new Uint8Array(bytes);
  if (u[0] === 0xff && u[1] === 0xd8 && u[2] === 0xff) return true;
  if (u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4e && u[3] === 0x47) return true;
  if (
    u.length >= 12 &&
    u[0] === 0x52 &&
    u[1] === 0x49 &&
    u[2] === 0x46 &&
    u[3] === 0x46 &&
    u[8] === 0x57 &&
    u[9] === 0x45 &&
    u[10] === 0x42 &&
    u[11] === 0x50
  ) {
    return true;
  }
  return false;
}

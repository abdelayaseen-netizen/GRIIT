/**
 * Generates a 6-character uppercase alphanumeric team code.
 * Excludes ambiguous chars (0/O, 1/I/L) to reduce typo risk.
 */
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateTeamCode(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

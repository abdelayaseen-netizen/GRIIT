/** Maestro flows sign up as b88…@example.com. Real addresses never match. */
export function isMaestroTestEmail(email: string): boolean {
  return /^b8\d.*@example\.com$/i.test(email.trim());
}

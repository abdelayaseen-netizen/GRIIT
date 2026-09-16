/** Login primary is live only when both fields have a value. */
export function loginCanSubmit(email: string, password: string): boolean {
  return email.trim().length > 0 && password.length > 0;
}

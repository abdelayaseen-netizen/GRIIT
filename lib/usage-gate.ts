/** In-memory switch for PostHog. Default on. Test accounts and the Settings toggle turn it off. */
let usageConsent = true;
let usageTestAccount = false;

export function usageAllowed(): boolean {
  return usageConsent && !usageTestAccount;
}

export function usageConsentOn(): boolean {
  return usageConsent;
}

export function setUsageConsentFlag(on: boolean): void {
  usageConsent = on;
}

export function setUsageTestAccount(isTest: boolean): void {
  usageTestAccount = isTest;
}

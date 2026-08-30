/**
 * Device IANA timezone + validation for profiles.timezone writes.
 */

import { getCalendars } from "expo-localization";
import {
  isValidIanaTimeZone,
  resolveIanaTimeZone,
} from "@/lib/iana-timezone-core";

export { isValidIanaTimeZone, resolveIanaTimeZone };

/** Device calendar timezone, validated (never stores invalid strings). */
export function getDeviceIanaTimeZone(): string {
  const device = getCalendars()[0]?.timeZone ?? null;
  return resolveIanaTimeZone(device, "UTC");
}

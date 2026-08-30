/**
 * Server-side IANA timezone validation for profiles.timezone writes.
 * Same rules as lib/iana-timezone-core.ts.
 */

export {
  isValidIanaTimeZone,
  resolveIanaTimeZone,
} from "../../lib/iana-timezone-core";

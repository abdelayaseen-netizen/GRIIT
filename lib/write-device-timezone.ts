/**
 * Persist the device IANA timezone onto profiles.timezone.
 *
 * handle_new_user (supabase/migrations/20260822120000_handle_new_user_anon_safe.sql)
 * inserts id/user_id/username only — timezone stays null. Home then falls back
 * to UTC (Friday 10pm ET reads as Saturday). Same contract as 3357fd6 on
 * profile-create paths: every session create/upgrade must write this.
 */
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { clearWrittenDeviceTimezone, noteWrittenDeviceTimezone, timezoneWriteSkipped } from "@/lib/timezone-heal";

export { noteWrittenDeviceTimezone, timezoneHealSkipped, timezoneWriteSkipped, writtenDeviceTimezone } from "@/lib/timezone-heal";

export async function writeDeviceTimezone(): Promise<string | null> {
  try {
    const timezone = getDeviceIanaTimeZone();
    if (timezoneWriteSkipped(timezone)) return timezone;
    // Claim before the POST so AppContext heal cannot race a second update.
    noteWrittenDeviceTimezone(timezone);
    await trpcMutate(TRPC.profiles.update, { timezone });
    return timezone;
  } catch (err) {
    clearWrittenDeviceTimezone();
    captureError(err, "writeDeviceTimezone");
    return null;
  }
}

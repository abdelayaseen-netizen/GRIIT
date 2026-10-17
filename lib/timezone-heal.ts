/** Last timezone this JS session successfully wrote. Heal skips when it matches the device. */
let writtenTz: string | null = null;

export function noteWrittenDeviceTimezone(tz: string): void {
  writtenTz = tz;
}

export function clearWrittenDeviceTimezone(): void {
  writtenTz = null;
}

export function writtenDeviceTimezone(): string | null {
  return writtenTz;
}

/** True when AppContext must not POST profiles.update + refresh bootstrap for timezone. */
export function timezoneHealSkipped(input: { profileTz: string; deviceTz: string }): boolean {
  if (input.profileTz && input.profileTz === input.deviceTz) return true;
  if (!input.profileTz && writtenTz === input.deviceTz) return true;
  return false;
}

/** True when writeDeviceTimezone must not POST this timezone again this session. */
export function timezoneWriteSkipped(deviceTz: string): boolean {
  return writtenTz === deviceTz;
}

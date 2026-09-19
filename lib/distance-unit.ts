export type DistanceUnit = "km" | "mi";

export const DEFAULT_DISTANCE_UNIT: DistanceUnit = "mi";

export function parseDistanceUnit(value: unknown): DistanceUnit {
  return value === "km" ? "km" : "mi";
}

/** Run field suffix: task config.unit from first render, then the profile. */
export function runDistanceUnit(taskUnit: unknown, profileUnit?: unknown): DistanceUnit {
  if (taskUnit === "km" || taskUnit === "mi") return taskUnit;
  return parseDistanceUnit(profileUnit);
}

export function formatDistance(km: number, unit: DistanceUnit): string {
  if (unit === "mi") {
    const mi = km / 1.609344;
    return `${mi.toFixed(2)} mi`;
  }
  return `${km.toFixed(2)} km`;
}

export function toKilometers(value: number, unit: DistanceUnit): number {
  return unit === "mi" ? value * 1.609344 : value;
}

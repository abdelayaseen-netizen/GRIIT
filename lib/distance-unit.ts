export type DistanceUnit = "km" | "mi";

export const DEFAULT_DISTANCE_UNIT: DistanceUnit = "mi";

export function parseDistanceUnit(value: unknown): DistanceUnit {
  return value === "km" ? "km" : "mi";
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

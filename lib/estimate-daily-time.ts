/**
 * Rough daily time estimate for review step (Phase 10 spec).
 * Uses wizard-local task shapes with optional `wizardType` for display routing.
 */

export type EstimateTaskInput = {
  type: string;
  wizardType?: string;
  durationMinutes?: number;
  targetValue?: number;
  unit?: string;
  trackingMode?: string;
  minWords?: number;
  journalPrompt?: string;
};

export function estimateDailyMinutes(tasks: EstimateTaskInput[]): number {
  let total = 0;
  for (const task of tasks) {
    const t = (task.wizardType ?? task.type).toLowerCase();
    switch (t) {
      case "timer":
        total += task.durationMinutes ?? 0;
        break;
      case "workout":
        total += task.durationMinutes ?? task.targetValue ?? 0;
        break;
      case "run": {
        const dist = task.targetValue ?? 0;
        const perUnit = task.unit === "km" ? 6 : 10;
        total += dist * perUnit;
        break;
      }
      case "reading":
        total += (task.targetValue ?? 0) * 2;
        break;
      case "journal":
        total += 5;
        break;
      case "photo":
        total += 2;
        break;
      case "simple":
        total += 2;
        break;
      case "checkin":
      case "check-in":
        total += 5;
        break;
      case "water":
        total += 1;
        break;
      case "counter":
        total += 5;
        break;
      default:
        total += 5;
    }
  }
  return total;
}

export function formatEstimatedDailyLabel(mins: number): string {
  if (mins < 30) return "~30 min/day";
  if (mins <= 60) return `~${Math.round(mins / 15) * 15} min/day`;
  const hrs = mins / 60;
  const rounded = Math.round(hrs * 2) / 2;
  const unit = rounded === 1 ? "hr" : "hrs";
  return `~${rounded} ${unit}/day`;
}

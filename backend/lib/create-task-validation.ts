/**
 * Per-task create checks — challenges-create.ts L205–238.
 * Shared so pack payload tests hit the same gate as the route.
 */

export type CreateTaskValidationInput = {
  title: string;
  type: string;
  minWords?: number;
  durationMinutes?: number;
  trackingMode?: string;
  targetValue?: number;
  locationName?: string;
  radiusMeters?: number;
};

export function validateCreateTask(
  task: CreateTaskValidationInput | undefined,
  index: number,
): string | null {
  if (!task) {
    return `Task ${index + 1}: missing`;
  }
  if (!task.title.trim()) {
    return `Task ${index + 1}: Title is required`;
  }

  switch (task.type) {
    case "journal":
      if (task.minWords != null && task.minWords <= 0) {
        return `Task "${task.title}": Minimum words must be positive`;
      }
      break;
    case "timer":
      if (!task.durationMinutes || task.durationMinutes <= 0) {
        return `Task "${task.title}": Duration is required`;
      }
      break;
    case "run":
      if (task.trackingMode === "distance") {
        if (!task.targetValue || task.targetValue <= 0) {
          return `Task "${task.title}": Distance is required`;
        }
      } else if (task.trackingMode === "time") {
        if (!task.targetValue || task.targetValue <= 0) {
          return `Task "${task.title}": Time duration is required`;
        }
      }
      break;
    case "checkin":
      if (!task.locationName || !task.locationName.trim()) {
        return `Task "${task.title}": Location name is required`;
      }
      if (!task.radiusMeters || task.radiusMeters <= 0) {
        return `Task "${task.title}": Radius is required`;
      }
      break;
    case "water":
      if (!task.targetValue || task.targetValue <= 0) {
        return `Task "${task.title}": Target is required`;
      }
      break;
    case "reading":
      if (!task.targetValue || task.targetValue <= 0) {
        return `Task "${task.title}": Target pages is required`;
      }
      break;
    case "counter":
      if (!task.targetValue || task.targetValue <= 0) {
        return `Task "${task.title}": Target count is required`;
      }
      break;
  }

  return null;
}

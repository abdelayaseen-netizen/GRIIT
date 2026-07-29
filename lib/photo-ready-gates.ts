/**
 * Gate rows for Photo · Ready (task-states-v2).
 * Only gates that apply from real task config — honest cut.
 */
import { formatScheduleWindowRange } from "@/lib/schedule-window";

export type PhotoReadyGateData = {
  key: string;
  label: string;
  sublabel?: string;
};

export const PHOTO_READY_HELPER =
  "No timer — shoot when the room is done." as const;

export const PHOTO_READY_SUBTYPE = "Photo proof" as const;

export function buildPhotoReadyGates(config: {
  schedule_window_start?: string | null;
  schedule_window_end?: string | null;
  require_camera_only?: boolean | null;
}): PhotoReadyGateData[] {
  const gates: PhotoReadyGateData[] = [];

  const range = formatScheduleWindowRange(
    config.schedule_window_start,
    config.schedule_window_end
  );
  if (range) {
    gates.push({
      key: "time",
      label: "Time window",
      sublabel: range,
    });
  }

  if (config.require_camera_only === true) {
    gates.push({
      key: "camera",
      label: "Camera only",
      sublabel: "Library blocked",
    });
  }

  return gates;
}

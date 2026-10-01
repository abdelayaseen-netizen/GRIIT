export type CameraPermissionSnapshot = {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
};

export type CameraPermissionGate = "loading" | "camera" | "request" | "settings";

/** Settings only when denied and the OS will not ask again. */
export function cameraPermissionGate(
  permission: CameraPermissionSnapshot | null | undefined,
): CameraPermissionGate {
  if (!permission) return "loading";
  if (permission.granted) return "camera";
  if (permission.status === "undetermined") return "request";
  if (permission.status === "denied" && permission.canAskAgain === false) return "settings";
  return "request";
}

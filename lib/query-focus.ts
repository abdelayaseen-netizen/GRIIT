/** Map React Native AppState onto TanStack Query's focus manager. */
export function queryFocusedFromAppState(status: string): boolean {
  return status === "active";
}

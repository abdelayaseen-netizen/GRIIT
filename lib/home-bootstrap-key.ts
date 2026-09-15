export const HOME_BOOTSTRAP_QUERY_KEY = ["home", "bootstrap"] as const;

export function homeBootstrapQueryKey(userId: string) {
  return [...HOME_BOOTSTRAP_QUERY_KEY, userId] as const;
}

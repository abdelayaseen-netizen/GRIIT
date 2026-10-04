let minSupportedBuild: number | null = null;

function apiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!envUrl || typeof envUrl !== "string") return "";
  return envUrl.replace(/\/$/, "").trim();
}

export function getMinSupportedBuild(): number | null {
  return minSupportedBuild;
}

export function parseMinSupportedBuild(body: unknown): number | null {
  const raw = (body as { min_supported_build?: unknown } | null)?.min_supported_build;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

type FetchLike = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/** Read remote config on launch. A missing endpoint leaves the value unset. */
export async function readMinSupportedBuild(fetchImpl: FetchLike = fetch): Promise<number | null> {
  const base = apiBase();
  if (!base) return minSupportedBuild;
  try {
    const res = await fetchImpl(`${base}/api/config`);
    if (!res.ok) return minSupportedBuild;
    minSupportedBuild = parseMinSupportedBuild(await res.json());
    return minSupportedBuild;
  } catch {
    return minSupportedBuild;
  }
}

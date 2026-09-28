/**
 * Phase 1 signed-URL resolver for task-proofs.
 * Service-role mint only. TTL 300s. One createSignedUrls batch per call.
 * A path is signed only if the viewer owns the first folder or a shared
 * activity row references it. Anything else is null.
 */
import { logger } from "./logger";
import { getSupabaseServer } from "./supabase-server";

export const PROOF_BUCKET = "task-proofs";
export const PROOF_SIGN_TTL_SEC = 300;

const UUID_FOLDER =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rewrite helper for the path-migration SQL. Do not call from writes until build 66. */
export function storedProofValue(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return toProofPath(trimmed) ?? trimmed;
}

/** Store the client value as-sent if the writer owns the object. file:// and anyone else's path → null. */
export function ownedProofWrite(
  raw: string | null | undefined,
  userId: string,
): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^file:/i.test(trimmed)) {
    logger.warn({ userId }, "[proof-image] drop file:// proof write");
    return null;
  }
  const path = toProofPath(trimmed);
  if (!path || pathOwnerId(path) !== userId) {
    logger.warn({ userId, path }, "[proof-image] drop unowned proof write");
    return null;
  }
  return trimmed;
}

export function toProofPath(stored: string | null | undefined): string | null {
  const s = stored?.trim();
  if (!s || /^file:/i.test(s)) return null;
  if (/^https?:\/\//i.test(s)) {
    try {
      const url = new URL(s);
      const signed = url.pathname.match(/\/storage\/v1\/object\/sign\/task-proofs\/(.+)$/i);
      if (signed?.[1]) return decodeURIComponent(signed[1]);
      const pub = url.pathname.match(/\/storage\/v1\/object\/public\/task-proofs\/(.+)$/i);
      if (pub?.[1]) return decodeURIComponent(pub[1]);
      return null;
    } catch {
      return null;
    }
  }
  const bare = s.replace(/^\/+/, "").replace(/^task-proofs\//i, "");
  return bare || null;
}

export function pathOwnerId(path: string): string | null {
  const first = path.split("/")[0] ?? "";
  return UUID_FOLDER.test(first) ? first : null;
}

export function canSignProofPath(
  path: string,
  viewerId: string,
  sharedPaths: ReadonlySet<string>,
): boolean {
  return pathOwnerId(path) === viewerId || sharedPaths.has(path);
}

export function sharedPathsFromEvents(
  events: readonly {
    user_id?: string | null;
    metadata?: Record<string, unknown> | null;
    shared?: boolean | null;
    share_state?: string | null;
  }[],
): Set<string> {
  const out = new Set<string>();
  for (const ev of events) {
    const isShared = ev.share_state === "shared" || ev.shared === true;
    if (!isShared) continue;
    const author = ev.user_id;
    const md = ev.metadata ?? {};
    for (const raw of [md.photo_url, md.proof_photo_url]) {
      const path = toProofPath(typeof raw === "string" ? raw : null);
      if (path && author && pathOwnerId(path) === author) out.add(path);
    }
  }
  return out;
}

export type SignProofPathsOpts = {
  sharedPaths?: ReadonlySet<string>;
  loadSharedPaths?: (paths: string[]) => Promise<Set<string>>;
  createSignedUrls?: (paths: string[], ttl: number) => Promise<Map<string, string | null>>;
};

export function sharedProofOrFilter(paths: string[]): string {
  return paths
    .flatMap((p) => [
      `metadata->>photo_url.eq.${p}`,
      `metadata->>proof_photo_url.eq.${p}`,
      `metadata->>photo_url.eq.task-proofs/${p}`,
      `metadata->>proof_photo_url.eq.task-proofs/${p}`,
      `metadata->>photo_url.like.%/task-proofs/${p}%`,
      `metadata->>proof_photo_url.like.%/task-proofs/${p}%`,
    ])
    .join(",");
}

export function sharedPathsFromLoadedRows(
  rows: readonly {
    user_id?: string | null;
    metadata?: Record<string, unknown> | null;
  }[],
  want: ReadonlySet<string>,
): Set<string> {
  const found = new Set<string>();
  for (const row of rows) {
    const author = row.user_id;
    const md = row.metadata ?? {};
    for (const raw of [md.photo_url, md.proof_photo_url]) {
      const path = toProofPath(typeof raw === "string" ? raw : null);
      if (path && want.has(path) && author && pathOwnerId(path) === author) found.add(path);
    }
  }
  return found;
}

export type SharedPathQuery = (args: {
  candidates: string[];
  orFilter: string;
}) => Promise<{ user_id?: string | null; metadata?: Record<string, unknown> | null }[]>;

async function supabaseSharedPathQuery(args: {
  candidates: string[];
  orFilter: string;
}): Promise<{ user_id?: string | null; metadata?: Record<string, unknown> | null }[]> {
  const svc = getSupabaseServer();
  if (!svc || args.candidates.length === 0) return [];
  const { data, error } = await svc
    .from("activity_events")
    .select("user_id, metadata")
    .eq("share_state", "shared")
    .in("event_type", ["task_completed", "secured_day"])
    .or(args.orFilter);
  if (error) {
    logger.error(
      { code: error.code, message: error.message, details: error.details },
      "[proof-image] load shared activity paths",
    );
    return [];
  }
  return (data ?? []) as { user_id?: string | null; metadata?: Record<string, unknown> | null }[];
}

/** Shared rows that reference this path (bare path or /task-proofs/{path} URL). Author must own the path. */
export async function loadSharedPathsForCandidates(
  candidates: string[],
  query: SharedPathQuery = supabaseSharedPathQuery,
): Promise<Set<string>> {
  if (candidates.length === 0) return new Set();
  const rows = await query({ candidates, orFilter: sharedProofOrFilter(candidates) });
  return sharedPathsFromLoadedRows(rows, new Set(candidates));
}

async function defaultLoadSharedPaths(candidates: string[]): Promise<Set<string>> {
  return loadSharedPathsForCandidates(candidates);
}

async function defaultCreateSignedUrls(
  paths: string[],
  ttl: number,
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  const svc = getSupabaseServer();
  if (!svc || paths.length === 0) {
    for (const p of paths) out.set(p, null);
    return out;
  }
  const { data, error } = await svc.storage.from(PROOF_BUCKET).createSignedUrls(paths, ttl);
  if (error) {
    logger.error(
      { code: (error as { statusCode?: string }).statusCode, message: error.message },
      "[proof-image] createSignedUrls",
    );
    for (const p of paths) out.set(p, null);
    return out;
  }
  for (const row of data ?? []) {
    const path = row.path ?? "";
    if (path) out.set(path, row.signedUrl ?? null);
  }
  for (const p of paths) {
    if (!out.has(p)) out.set(p, null);
  }
  return out;
}

export async function signProofPaths(
  stored: readonly (string | null | undefined)[],
  viewerId: string,
  opts: SignProofPathsOpts = {},
): Promise<(string | null)[]> {
  const paths = stored.map((s) => toProofPath(s));
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  let shared = new Set(opts.sharedPaths ?? []);
  const needShared = unique.filter((p) => pathOwnerId(p) !== viewerId && !shared.has(p));
  if (needShared.length > 0) {
    const extra = await (opts.loadSharedPaths ?? defaultLoadSharedPaths)(needShared);
    shared = new Set([...shared, ...extra]);
  }
  const allowed = unique.filter((p) => canSignProofPath(p, viewerId, shared));
  const signedMap = allowed.length
    ? await (opts.createSignedUrls ?? defaultCreateSignedUrls)(allowed, PROOF_SIGN_TTL_SEC)
    : new Map<string, string | null>();
  return paths.map((p) => {
    if (!p || !canSignProofPath(p, viewerId, shared)) return null;
    return signedMap.get(p) ?? null;
  });
}

export async function signProofPair(
  photoUrl: string | null | undefined,
  proofPhotoUrl: string | null | undefined,
  viewerId: string,
  opts?: SignProofPathsOpts,
): Promise<{ photoUrl: string | null; proofPhotoUrl: string | null }> {
  const [photo, proof] = await signProofPaths([photoUrl, proofPhotoUrl], viewerId, opts);
  return { photoUrl: photo ?? null, proofPhotoUrl: proof ?? null };
}

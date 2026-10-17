/**
 * Build 90 07.3: comments this phone's user reported. Hidden at once and kept hidden
 * across reloads; the server also drops them from feed.getComments once the report is
 * stored. One AsyncStorage key, a JSON array of comment ids.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { withoutComments } from "@/lib/comment-report";

export const HIDDEN_COMMENTS_KEY = "griit.hidden.comments";
const MAX_IDS = 500;

let cache: Set<string> | null = null;
let loading: Promise<Set<string>> | null = null;

export function parseHiddenCommentIds(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

export async function loadHiddenCommentIds(): Promise<Set<string>> {
  if (cache) return cache;
  if (!loading) {
    loading = AsyncStorage.getItem(HIDDEN_COMMENTS_KEY)
      .then((raw) => {
        cache = parseHiddenCommentIds(raw);
        return cache;
      })
      .catch(() => {
        cache = new Set();
        return cache;
      });
  }
  return loading;
}

export async function hideComment(commentId: string): Promise<void> {
  const ids = await loadHiddenCommentIds();
  ids.add(commentId);
  const list = [...ids].slice(-MAX_IDS);
  try {
    await AsyncStorage.setItem(HIDDEN_COMMENTS_KEY, JSON.stringify(list));
  } catch {
    // in memory only; the server filter covers the next load
  }
}

/** When the report itself failed, the comment comes back. */
export async function unhideComment(commentId: string): Promise<void> {
  const ids = await loadHiddenCommentIds();
  if (!ids.delete(commentId)) return;
  try {
    await AsyncStorage.setItem(HIDDEN_COMMENTS_KEY, JSON.stringify([...ids]));
  } catch {
    // in memory only
  }
}

/** Test seam. */
export function resetHiddenCommentsForTests(): void {
  cache = null;
  loading = null;
}

export type FetchedComment = {
  id: string;
  event_id: string;
  user_id: string;
  text: string;
  created_at: string;
  parent_id: string | null;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

/** The one place the client fetches comments: every list drops the reporter's hidden ids. */
export async function fetchComments(eventId: string, limit = 100): Promise<FetchedComment[]> {
  const [rows, hidden] = await Promise.all([
    trpcQuery(TRPC.feed.getComments, { eventId, limit }) as Promise<FetchedComment[]>,
    loadHiddenCommentIds(),
  ]);
  return withoutComments(rows ?? [], hidden);
}

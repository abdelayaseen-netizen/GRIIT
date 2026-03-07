import { serialize, deserialize } from "superjson";
import { supabase } from "./supabase";
import { getTrpcUrl, fetchWithRetry } from "./api";
import { notifySessionExpired } from "./auth-expiry";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function trpcQuery<T = any>(
  path: string,
  input?: unknown,
): Promise<T> {
  const url = getTrpcUrl();
  const authHeaders = await getAuthHeaders();

  const queryInput = input !== undefined
    ? `?input=${encodeURIComponent(JSON.stringify(serialize(input)))}`
    : "";

  const response = await fetchWithRetry(`${url}/${path}${queryInput}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await supabase.auth.signOut();
      notifySessionExpired();
    }
    throw new Error(`tRPC query failed: ${path} (${response.status})`);
  }

  const json = await response.json();
  const result = json?.result?.data;
  if (result !== undefined) {
    return deserialize(result) as T;
  }
  return json as T;
}

export async function trpcMutate<T = any>(
  path: string,
  input?: unknown,
): Promise<T> {
  const url = getTrpcUrl();
  const authHeaders = await getAuthHeaders();

  const body = input !== undefined
    ? JSON.stringify(serialize(input))
    : undefined;

  const response = await fetchWithRetry(`${url}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body,
  });

  if (!response.ok) {
    if (response.status === 401) {
      await supabase.auth.signOut();
      notifySessionExpired();
    }
    const text = await response.text().catch(() => "");
    let errorMessage = `tRPC mutation failed: ${path} (${response.status})`;
    let errorCode: string | undefined;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) errorMessage = parsed.error.message;
      else if (parsed?.error?.json?.message) errorMessage = parsed.error.json.message;
      errorCode = parsed?.error?.data?.code ?? parsed?.error?.code;
    } catch {}
    const err = new Error(errorMessage) as Error & { data?: { code?: string } };
    if (errorCode) err.data = { code: errorCode };
    throw err;
  }

  const json = await response.json();
  const result = json?.result?.data;
  if (result !== undefined) {
    return deserialize(result) as T;
  }
  return json as T;
}

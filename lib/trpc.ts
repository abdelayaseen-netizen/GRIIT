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
  const fullUrl = `${url}/${path}`;
  const authHeaders = await getAuthHeaders();

  const body = input !== undefined
    ? JSON.stringify(serialize(input))
    : undefined;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[TRPC] Making request to:", fullUrl);
    console.log("[TRPC] Method: POST");
    const token = (authHeaders.authorization ?? "").replace(/^Bearer\s+/i, "");
    console.log("[TRPC] Auth token present:", !!token, token ? `${token.substring(0, 20)}...` : "none");
    console.log("[TRPC] Body:", body);
  }

  const response = await fetchWithRetry(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body,
  });

  const responseText = await response.text().catch(() => "");

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[TRPC] Response status:", response.status);
    console.log("[TRPC] Response body:", responseText?.substring(0, 500));
  }

  if (!response.ok) {
    if (response.status === 401) {
      await supabase.auth.signOut();
      notifySessionExpired();
    }
    let errorMessage = `tRPC mutation failed: ${path} (${response.status})`;
    let errorCode: string | undefined;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed?.error?.message) errorMessage = parsed.error.message;
      else if (parsed?.error?.json?.message) errorMessage = parsed.error.json.message;
      errorCode = parsed?.error?.data?.code ?? parsed?.error?.code;
    } catch {}
    const err = new Error(errorMessage) as Error & { data?: { code?: string } };
    if (errorCode) err.data = { code: errorCode };
    throw err;
  }

  let json: { result?: { data?: unknown }; error?: { message?: string; data?: { code?: string } } };
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(`tRPC mutation failed: ${path} — invalid JSON response`);
  }

  if (json?.error) {
    const errorMessage = json.error.message ?? "Request failed";
    const errorCode = json.error.data?.code;
    const err = new Error(errorMessage) as Error & { data?: { code?: string } };
    if (errorCode) err.data = { code: errorCode };
    throw err;
  }

  const result = json?.result?.data;
  if (result !== undefined && result !== null) {
    return deserialize(result as Parameters<typeof deserialize>[0]) as T;
  }
  return json as T;
}

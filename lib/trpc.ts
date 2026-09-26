import { serialize, deserialize } from "superjson";
import { supabase } from "./supabase";
import { getTrpcUrl, fetchWithRetry } from "./api";
import { notifySessionExpired, shouldNotifySessionExpired } from "./auth-expiry";
import { captureError } from "@/lib/sentry";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function trpcQuery<T = unknown>(
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
      const { data: { session } } = await supabase.auth.getSession();
      if (shouldNotifySessionExpired(!!session)) {
        const userId = session?.user?.id;
        await supabase.auth.signOut();
        const { runClientSignOutCleanup } = await import("@/lib/signout-cleanup");
        await runClientSignOutCleanup(userId);
        const { clearOnboardingStorage } = await import("@/store/onboardingStore");
        await clearOnboardingStorage();
        notifySessionExpired();
      }
    }
    let errorMessage = `tRPC query failed: ${path} (${response.status})`;
    let errorData: Record<string, unknown> | undefined;
    try {
      const json = await response.clone().json();
      if (json?.error?.message) errorMessage = json.error.message;
      else if (json?.error?.json?.message) errorMessage = json.error.json.message;
      const rawData = json?.error?.data ?? json?.error?.json?.data;
      if (rawData && typeof rawData === "object") {
        errorData = rawData as Record<string, unknown>;
      }
    } catch {
      /* non-JSON body */
    }
    const err = new Error(errorMessage) as Error & { data?: Record<string, unknown> };
    if (errorData) err.data = errorData;
    throw err;
  }

  const json = await response.json();
  const result = json?.result?.data;
  if (result !== undefined) {
    return deserialize(result) as T;
  }
  return json as T;
}

export async function trpcMutate<T = unknown>(
  path: string,
  input?: unknown,
): Promise<T> {
  const url = getTrpcUrl();
  const fullUrl = `${url}/${path}`;
  const authHeaders = await getAuthHeaders();

  const body = JSON.stringify(serialize(input ?? {}));

  const response = await fetchWithRetry(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body,
  });

  const responseText = await response.text().catch(() => "");

  if (!response.ok) {
    if (response.status === 401) {
      const { data: { session } } = await supabase.auth.getSession();
      if (shouldNotifySessionExpired(!!session)) {
        const userId = session?.user?.id;
        await supabase.auth.signOut();
        const { runClientSignOutCleanup } = await import("@/lib/signout-cleanup");
        await runClientSignOutCleanup(userId);
        const { clearOnboardingStorage } = await import("@/store/onboardingStore");
        await clearOnboardingStorage();
        notifySessionExpired();
      }
    }
    let errorMessage = `tRPC mutation failed: ${path} (${response.status})`;
    let errorData: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed?.error?.message) errorMessage = parsed.error.message;
      else if (parsed?.error?.json?.message) errorMessage = parsed.error.json.message;
      const rawData = parsed?.error?.data ?? parsed?.error?.json?.data;
      if (rawData && typeof rawData === "object") {
        errorData = rawData as Record<string, unknown>;
      }
    } catch {
      // JSON parse failure means non-JSON response; fall through to default handling
    }
    const err = new Error(errorMessage) as Error & { data?: Record<string, unknown> };
    if (errorData) err.data = errorData;
    throw err;
  }

  let json: { result?: { data?: unknown }; error?: { message?: string; data?: { code?: string } } };
  try {
    json = JSON.parse(responseText);
  } catch (e) {
    captureError(e, "tRPCMutateInvalidJson");
    throw new Error(`tRPC mutation failed: ${path} — invalid JSON response`);
  }

  if (json?.error) {
    const errorMessage = json.error.message ?? "Request failed";
    const errorData = json.error.data;
    const errorCode = errorData?.code;
    const err = new Error(errorMessage) as Error & { data?: { code?: string; message?: string } };
    if (errorData) err.data = errorData;
    else if (errorCode) err.data = { code: errorCode };
    // error swallowed — handle in UI
    throw err;
  }

  const result = json?.result?.data;
  if (result !== undefined && result !== null) {
    return deserialize(result as Parameters<typeof deserialize>[0]) as T;
  }
  return json as T;
}

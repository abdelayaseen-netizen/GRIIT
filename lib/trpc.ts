import { serialize, deserialize } from "superjson";
import { supabase } from "./supabase";
import { getTrpcUrl, fetchWithRetry } from "./api";
import { notifySessionExpired } from "./auth-expiry";
import { captureError } from "@/lib/sentry";

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
      const { runClientSignOutCleanup } = await import("@/lib/signout-cleanup");
      await runClientSignOutCleanup();
      const { clearOnboardingStorage } = await import("@/store/onboardingStore");
      await clearOnboardingStorage();
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
      await supabase.auth.signOut();
      const { runClientSignOutCleanup } = await import("@/lib/signout-cleanup");
      await runClientSignOutCleanup();
      const { clearOnboardingStorage } = await import("@/store/onboardingStore");
      await clearOnboardingStorage();
      notifySessionExpired();
    }
    let errorMessage = `tRPC mutation failed: ${path} (${response.status})`;
    let errorCode: string | undefined;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed?.error?.message) errorMessage = parsed.error.message;
      else if (parsed?.error?.json?.message) errorMessage = parsed.error.json.message;
      errorCode = parsed?.error?.data?.code ?? parsed?.error?.code;
    } catch {
      // JSON parse failure means non-JSON response; fall through to default handling
    }
    const err = new Error(errorMessage) as Error & { data?: { code?: string } };
    if (errorCode) err.data = { code: errorCode };
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

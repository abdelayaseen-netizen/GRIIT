import { supabase } from '@/lib/supabase';

let _baseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (_baseUrl) return _baseUrl;
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envUrl) {
    _baseUrl = envUrl.replace(/\/$/, '');
    console.log('[API] Using base URL from env:', _baseUrl);
    return _baseUrl;
  }
  _baseUrl = '';
  console.warn('[API] No EXPO_PUBLIC_RORK_API_BASE_URL set, using relative URLs');
  return _baseUrl;
}

export function getHealthUrl(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/health` : '/api/health';
}

export function getTrpcUrl(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/trpc` : '/api/trpc';
}

const RETRY_DELAYS = [500, 1000, 2000, 4000];
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504, 408, 429]);

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('failed to fetch') ||
      msg.includes('network request failed') ||
      msg.includes('load failed') ||
      msg.includes('networkerror') ||
      msg.includes('request_timeout') ||
      msg.includes('aborted');
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs: number = 12000,
): Promise<Response> {
  const controller = new AbortController();
  const existingSignal = init?.signal;

  if (existingSignal?.aborted) {
    controller.abort(existingSignal.reason);
  } else if (existingSignal) {
    existingSignal.addEventListener('abort', () => controller.abort(existingSignal.reason), { once: true });
  }

  const timer = setTimeout(() => {
    controller.abort(new Error('REQUEST_TIMEOUT'));
  }, timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason;
      if (reason instanceof Error && reason.message === 'REQUEST_TIMEOUT') {
        throw new Error('REQUEST_TIMEOUT: Server did not respond in time. Try again.');
      }
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await fetchWithTimeout(input, init, 12000);

      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < RETRY_DELAYS.length) {
        console.warn(`[API] Retryable status ${response.status} on attempt ${attempt + 1}, retrying...`);
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (isRetryableError(error) && attempt < RETRY_DELAYS.length) {
        console.warn(`[API] Network error on attempt ${attempt + 1}, retrying in ${RETRY_DELAYS[attempt]}ms...`);
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error('Cannot reach server. Backend may be starting. Try again.');
}

export interface HealthCheckResult {
  ok: boolean;
  responseTimeMs: number;
  statusCode?: number;
  errorMessage?: string;
}

export async function checkHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const url = getHealthUrl();
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }, 4000);
    const responseTimeMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, responseTimeMs, statusCode: res.status, errorMessage: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: data?.ok === true, responseTimeMs, statusCode: res.status };
  } catch (error) {
    const responseTimeMs = Date.now() - start;
    const msg = formatError(error);
    return { ok: false, responseTimeMs, errorMessage: msg };
  }
}

export function formatError(error: unknown): string {
  if (error === null || error === undefined) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

export interface DbSanityResult {
  ok: boolean;
  missingTables: string[];
  errorMessage?: string;
}

function isNetworkError(error: unknown): boolean {
  const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error ?? ''));
  const lower = msg.toLowerCase();
  return lower.includes('failed to fetch') ||
    lower.includes('network request failed') ||
    lower.includes('load failed') ||
    lower.includes('networkerror') ||
    lower.includes('request_timeout') ||
    lower.includes('typeerror');
}

export async function checkDbTables(): Promise<DbSanityResult> {
  try {
    const requiredTables = ['challenges', 'challenge_tasks', 'active_challenges', 'check_ins', 'profiles', 'streaks'];
    const missingTables: string[] = [];
    let networkErrorCount = 0;

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          if (isNetworkError(error.message)) {
            networkErrorCount++;
            console.log(`[DB Sanity] Table "${table}" network error (skipping):`, error.message);
            continue;
          }
          const isMissing = error.code === 'PGRST205' || error.code === '42P01';
          if (isMissing) {
            missingTables.push(table);
          } else {
            console.log(`[DB Sanity] Table "${table}" query returned code=${error.code} (non-fatal)`);
          }
        }
      } catch (tableErr) {
        if (isNetworkError(tableErr)) {
          networkErrorCount++;
          console.log(`[DB Sanity] Table "${table}" network error (skipping)`);
          continue;
        }
        console.log(`[DB Sanity] Table "${table}" fetch failed (non-fatal):`, formatError(tableErr));
      }
    }

    if (networkErrorCount === requiredTables.length) {
      console.log('[DB Sanity] All tables had network errors — Supabase may be unreachable. Treating as OK.');
      return { ok: true, missingTables: [] };
    }

    if (missingTables.length > 0) {
      return { ok: false, missingTables, errorMessage: `Missing tables: ${missingTables.join(', ')}` };
    }

    return { ok: true, missingTables: [] };
  } catch (err) {
    const msg = formatError(err);
    console.log('[DB Sanity] Check failed (non-fatal):', msg);
    return { ok: true, missingTables: [] };
  }
}

export function formatTRPCError(error: unknown): {
  title: string;
  message: string;
  isNetwork: boolean;
} {
  const raw = formatError(error);

  if (
    raw.includes('Failed to fetch') ||
    raw.includes('Network request failed') ||
    raw.includes('Load failed') ||
    raw.includes('NetworkError') ||
    raw.includes('Cannot reach server')
  ) {
    return {
      title: 'Connection Issue',
      message: 'Cannot reach server. The backend may be starting up — please wait a moment and retry.',
      isNetwork: true,
    };
  }

  const trpcError = error as any;
  const shape = trpcError?.shape?.message || trpcError?.data?.message;
  const code = trpcError?.data?.code;

  let message = shape || raw || 'Something went wrong. Please try again.';
  let title = 'Error';

  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
    title = 'Not Authorized';
    message = 'Please sign in again.';
  } else if (code === 'BAD_REQUEST') {
    title = 'Invalid Input';
  } else if (code === 'INTERNAL_SERVER_ERROR') {
    title = 'Server Error';
  }

  return { title, message, isNetwork: false };
}
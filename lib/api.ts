import { Platform } from 'react-native';

const RAILWAY_BACKEND_URL = 'https://grit-production-8e7d.up.railway.app';

let _baseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (_baseUrl) return _baseUrl;

  const rawEnv = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  console.log('[API] RAW EXPO_PUBLIC_RORK_API_BASE_URL:', rawEnv);

  let url = (rawEnv ?? '').trim().replace(/\/$/, '');

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  if (!url || url.includes('rorktest.dev') || url.includes('rork.live') || url.includes('localhost')) {
    console.warn('[API] Ignoring platform-provided URL:', url || '(empty)', '— forcing Railway backend');
    url = RAILWAY_BACKEND_URL;
  }

  _baseUrl = url;
  console.log('[API] FINAL Base URL:', _baseUrl, '| Platform:', Platform.OS);
  return _baseUrl;
}

export function getHealthUrl(): string {
  return `${getApiBaseUrl()}/api/health`;
}

export function getTrpcUrl(): string {
  const url = `${getApiBaseUrl()}/api/trpc`;
  console.log('[API] TRPC URL:', url);
  return url;
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
    console.log('[API] Health check:', url);
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }, 4000);
    const responseTimeMs = Date.now() - start;
    if (!res.ok) {
      console.warn('[API] Health check returned status:', res.status);
      return { ok: false, responseTimeMs, statusCode: res.status, errorMessage: `HTTP ${res.status}` };
    }
    const data = await res.json();
    console.log('[API] Health check OK:', data, `(${responseTimeMs}ms)`);
    return { ok: data?.ok === true, responseTimeMs, statusCode: res.status };
  } catch (error) {
    const responseTimeMs = Date.now() - start;
    const msg = formatError(error);
    console.warn('[API] Health check failed:', msg, `(${responseTimeMs}ms)`);
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

export async function checkDbTables(): Promise<DbSanityResult> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const requiredTables = ['challenges', 'challenge_tasks', 'active_challenges', 'check_ins', 'profiles', 'streaks'];
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          const isMissing = error.code === 'PGRST205' || error.code === '42P01';
          console.error(`[DB Sanity] Table "${table}" error: code=${error.code}, message=${error.message}, details=${error.details ?? 'none'}, hint=${error.hint ?? 'none'}`);
          if (isMissing) {
            missingTables.push(table);
          }
        }
      } catch (tableErr) {
        console.error(`[DB Sanity] Exception checking table "${table}":`, formatError(tableErr));
      }
    }

    if (missingTables.length > 0) {
      console.error('[DB Sanity] Missing tables:', missingTables.join(', '));
      return { ok: false, missingTables, errorMessage: `Missing tables: ${missingTables.join(', ')}` };
    }

    console.log('[DB Sanity] All required tables present');
    return { ok: true, missingTables: [] };
  } catch (err) {
    const msg = formatError(err);
    console.error('[DB Sanity] Check failed:', msg);
    return { ok: false, missingTables: [], errorMessage: msg };
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

  console.error('[TRPC ERROR]', JSON.stringify({
    message: raw,
    code,
    shape: trpcError?.shape,
    data: trpcError?.data,
  }, null, 2));

  return { title, message, isNetwork: false };
}

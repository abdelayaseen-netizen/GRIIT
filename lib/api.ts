import { supabase } from '@/lib/supabase';
import { TRPC_ERROR_CODE, TRPC_ERROR_TITLES, TRPC_ERROR_USER_MESSAGE } from '@/lib/trpc-errors';
import { captureError } from '@/lib/sentry';

/**
 * Backend path constants. Must match backend/hono.ts exactly:
 * - app.get("/api/health", ...) and app.get("/health", ...)
 * - app.use("/api/trpc/*", trpcServer({ endpoint: "/api/trpc", ... }))
 */
const TRPC_PATH = '/api/trpc';
const HEALTH_PATH = '/api/health';

let _baseUrl: string | null = null;

/**
 * Base URL of the backend API (no trailing slash).
 * Env: EXPO_PUBLIC_API_URL (prefer) or EXPO_PUBLIC_API_BASE_URL.
 * In production (Rork + Railway) MUST be set to the backend host — e.g. https://your-backend.up.railway.app.
 * If unset in production, tRPC requests use relative path and hit the frontend host → 404.
 */
export function getApiBaseUrl(): string {
  if (_baseUrl !== null) return _baseUrl;
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string') {
    _baseUrl = envUrl.replace(/\/$/, '').trim();
    return _baseUrl;
  }
  _baseUrl = '';
  return _baseUrl;
}

function getHealthUrl(): string {
  const base = getApiBaseUrl();
  if (base) return `${base}${HEALTH_PATH}`;
  return HEALTH_PATH;
}

/** Full URL for tRPC (baseUrl + TRPC_PATH). Must match backend mount: app.use("/api/trpc/*", ...). */
export function getTrpcUrl(): string {
  const base = getApiBaseUrl();
  const url = base ? `${base}${TRPC_PATH}` : TRPC_PATH;
  return url;
}

const RETRY_DELAYS = [500, 1000, 2000, 4000];
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504, 408, 429]);

const NETWORK_ERROR_PATTERNS = [
  'failed to fetch',
  'network request failed',
  'load failed',
  'networkerror',
  'request_timeout',
  'aborted',
  'typeerror',
];

function isNetworkLikeError(error: unknown): boolean {
  const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error ?? ''));
  const lower = msg.toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((p) => lower.includes(p));
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
        await sleep(RETRY_DELAYS[attempt] ?? 500);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (isNetworkLikeError(error) && attempt < RETRY_DELAYS.length) {
        await sleep(RETRY_DELAYS[attempt] ?? 500);
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
    captureError(error, 'checkHealth');
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
    } catch (e) {
      captureError(e, 'formatErrorStringify');
      return String(error);
    }
  }
  return String(error);
}

interface DbSanityResult {
  ok: boolean;
  missingTables: string[];
  errorMessage?: string;
}

export async function checkDbTables(): Promise<DbSanityResult> {
  try {
    const requiredTables = ['challenges', 'challenge_tasks', 'active_challenges', 'check_ins', 'profiles', 'streaks'];
    const missingTables: string[] = [];
    let networkErrorCount = 0;

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          if (isNetworkLikeError(error.message)) {
            networkErrorCount++;
            continue;
          }
          const isMissing = error.code === 'PGRST205' || error.code === '42P01';
          if (isMissing) missingTables.push(table);
        }
      } catch (tableErr) {
        if (isNetworkLikeError(tableErr)) {
          networkErrorCount++;
          continue;
        }
      }
    }

    if (networkErrorCount === requiredTables.length) {
      return { ok: true, missingTables: [] };
    }

    if (missingTables.length > 0) {
      return { ok: false, missingTables, errorMessage: `Missing tables: ${missingTables.join(', ')}` };
    }

    return { ok: true, missingTables: [] };
  } catch (error) {
    captureError(error, 'checkDbTables');
    return { ok: true, missingTables: [] };
  }
}

/** Parse Zod-style validation error (JSON array of { message?, path? }) into a single user-friendly string. */
function parseZodErrorMessage(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.includes('"')) {
    try {
      const arr = JSON.parse(trimmed) as unknown[];
      if (!Array.isArray(arr)) return null;
      const parts: string[] = [];
      for (const item of arr) {
        if (item && typeof item === 'object' && 'message' in item && typeof (item as { message: unknown }).message === 'string') {
          parts.push((item as { message: string }).message);
        }
      }
      if (parts.length > 0) return parts.join('. ');
    } catch {
      /* not valid JSON */
    }
  }
  return null;
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

  interface TrpcErrorShape {
    shape?: { message?: string };
    data?: { code?: string; message?: string };
    message?: string;
  }
  const trpcError = error as TrpcErrorShape;
  const shape = trpcError?.shape?.message ?? trpcError?.data?.message ?? trpcError?.message;
  const code = trpcError?.data?.code as string | undefined;
  const rawMessage = typeof shape === 'string' ? shape : raw;

  const zodParsed = parseZodErrorMessage(rawMessage);
  const message = zodParsed ?? (rawMessage || 'Something went wrong. Please try again.');
  let title = 'Error';

  if (code && (code === TRPC_ERROR_CODE.UNAUTHORIZED || code === TRPC_ERROR_CODE.FORBIDDEN)) {
    title = TRPC_ERROR_TITLES[TRPC_ERROR_CODE.UNAUTHORIZED];
    return { title, message: TRPC_ERROR_USER_MESSAGE[TRPC_ERROR_CODE.UNAUTHORIZED] ?? message, isNetwork: false };
  }
  if (code === TRPC_ERROR_CODE.BAD_REQUEST && zodParsed) {
    title = "Couldn't create challenge";
    return { title, message, isNetwork: false };
  }
  if (code && code in TRPC_ERROR_TITLES) {
    title = TRPC_ERROR_TITLES[code as keyof typeof TRPC_ERROR_TITLES];
    if (code in TRPC_ERROR_USER_MESSAGE) {
      const genericMessage = TRPC_ERROR_USER_MESSAGE[code as keyof typeof TRPC_ERROR_USER_MESSAGE];
      const serverMessage = rawMessage?.trim();
      return { title, message: serverMessage || (genericMessage ?? message), isNetwork: false };
    }
  }

  return { title, message, isNetwork: false };
}
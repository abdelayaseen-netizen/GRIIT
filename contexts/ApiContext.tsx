import { createContext, useContext, ReactNode } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react';
import { checkHealth, getApiBaseUrl, formatError, checkDbTables } from '@/lib/api';
import type { HealthCheckResult } from '@/lib/api';

export type ApiStatus = 'checking' | 'ready' | 'down';
export type DbStatus = 'unchecked' | 'ok' | 'missing_tables' | 'error';

export interface ApiDiagnostics {
  baseUrl: string;
  platform: string;
  timestamp: string;
  healthStatus: ApiStatus;
  dbStatus: DbStatus;
  missingTables: string[];
  lastResponseTimeMs: number | null;
  lastErrorMessage: string | null;
  retryAttempts: number;
}

type ApiContextValue = {
  apiStatus: ApiStatus;
  apiReady: boolean;
  checking: boolean;
  dbStatus: DbStatus;
  missingTables: string[];
  dbMisconfigured: boolean;
  lastResponseTimeMs: number | null;
  lastErrorMessage: string | null;
  retryNow: () => Promise<void>;
  runDbSanityCheck: () => Promise<void>;
  getDiagnostics: () => ApiDiagnostics;
  getDiagnosticsString: () => string;
};

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
}

export function ApiProvider({ children }: { children: ReactNode }) {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [dbStatus, setDbStatus] = useState<DbStatus>('unchecked');
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [lastResponseTimeMs, setLastResponseTimeMs] = useState<number | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const retryCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const dbCheckedRef = useRef(false);

  const getBaseUrlSafe = useCallback((): string => {
    try {
      return getApiBaseUrl();
    } catch {
      return 'NOT_SET';
    }
  }, []);

  const runDbSanityCheck = useCallback(async () => {
    if (dbCheckedRef.current) return;
    try {
      console.log('[ApiContext] Running DB sanity check...');
      const result = await checkDbTables();
      if (!mountedRef.current) return;

      if (result.ok) {
        console.log('[ApiContext] DB sanity check passed');
        setDbStatus('ok');
        setMissingTables([]);
        dbCheckedRef.current = true;
      } else if (result.missingTables.length > 0) {
        console.error('[ApiContext] DB missing tables:', result.missingTables);
        setDbStatus('missing_tables');
        setMissingTables(result.missingTables);
        setLastErrorMessage(`Database misconfigured: missing table(s) ${result.missingTables.join(', ')}. Run seed.sql in Supabase.`);
      } else {
        console.error('[ApiContext] DB sanity check error:', result.errorMessage);
        setDbStatus('error');
        setLastErrorMessage(result.errorMessage || 'DB check failed');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[ApiContext] DB sanity check exception:', formatError(err));
      setDbStatus('error');
    }
  }, []);

  const runHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      if (mountedRef.current) setApiStatus('checking');
      const result: HealthCheckResult = await checkHealth();
      if (!mountedRef.current) return false;

      setLastResponseTimeMs(result.responseTimeMs);

      if (result.ok) {
        console.log('[ApiContext] Backend is ready', `(${result.responseTimeMs}ms)`);
        setApiStatus('ready');
        setLastErrorMessage(null);
        retryCount.current = 0;

        if (!dbCheckedRef.current) {
          runDbSanityCheck();
        }
        return true;
      }

      const errMsg = result.errorMessage || `HTTP ${result.statusCode || 'unknown'}`;
      console.warn('[ApiContext] Backend not ready, attempt', retryCount.current + 1, errMsg);
      setApiStatus('down');
      setLastErrorMessage(errMsg);
      return false;
    } catch (err) {
      if (!mountedRef.current) return false;
      const errMsg = formatError(err);
      console.warn('[ApiContext] Health check error, attempt', retryCount.current + 1, errMsg);
      setApiStatus('down');
      setLastErrorMessage(errMsg);
      return false;
    }
  }, [runDbSanityCheck]);

  const scheduleRetry = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const delays = [500, 1000, 2000, 4000];
    const delay = delays[Math.min(retryCount.current, delays.length - 1)];
    retryCount.current += 1;

    console.log(`[ApiContext] Scheduling retry in ${delay}ms (attempt ${retryCount.current})`);

    timerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      const ok = await runHealthCheck();
      if (!ok && mountedRef.current && retryCount.current < 8) {
        scheduleRetry();
      }
    }, delay);
  }, [runHealthCheck]);

  const retryNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    retryCount.current = 0;
    setApiStatus('checking');
    const ok = await runHealthCheck();
    if (!ok && mountedRef.current) {
      scheduleRetry();
    }
  }, [runHealthCheck, scheduleRetry]);

  const getDiagnostics = useCallback((): ApiDiagnostics => {
    return {
      baseUrl: getBaseUrlSafe(),
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      healthStatus: apiStatus,
      dbStatus,
      missingTables,
      lastResponseTimeMs,
      lastErrorMessage,
      retryAttempts: retryCount.current,
    };
  }, [apiStatus, dbStatus, missingTables, lastResponseTimeMs, lastErrorMessage, getBaseUrlSafe]);

  const getDiagnosticsString = useCallback((): string => {
    try {
      return JSON.stringify(getDiagnostics(), null, 2);
    } catch {
      return 'Failed to serialize diagnostics';
    }
  }, [getDiagnostics]);

  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      const ok = await runHealthCheck();
      if (!ok && mountedRef.current) {
        scheduleRetry();
      }
    })();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runHealthCheck, scheduleRetry]);

  return (
    <ApiContext.Provider
      value={{
        apiStatus,
        apiReady: apiStatus === 'ready' && dbStatus !== 'missing_tables',
        checking: apiStatus === 'checking',
        dbStatus,
        missingTables,
        dbMisconfigured: dbStatus === 'missing_tables',
        lastResponseTimeMs,
        lastErrorMessage,
        retryNow,
        runDbSanityCheck,
        getDiagnostics,
        getDiagnosticsString,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

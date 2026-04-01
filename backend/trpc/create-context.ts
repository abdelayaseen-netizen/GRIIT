import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@supabase/supabase-js";
import { supabase as sharedSupabase } from "../lib/supabase";
import { getClientIp } from "../lib/rate-limit";
import { reportError } from "../lib/error-reporting";
import { logger } from "../lib/logger";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

function createUserSupabase(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export const createContext = async (opts: { req: Request }) => {
  const requestId = opts.req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const clientIp = getClientIp(opts.req);
  const authHeader = opts.req.headers.get("authorization");
  let userId: string | null = null;
  let supabase = sharedSupabase;

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      try {
        const { data: { user }, error } = await sharedSupabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
          supabase = createUserSupabase(token);
        }
      } catch (err) {
        logger.error({ err }, "[createContext] auth.getUser failed");
      }
    }
  }

  return {
    req: opts.req,
    requestId,
    clientIp,
    userId,
    supabase,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

function logStructured(payload: {
  requestId: string;
  path?: string;
  userId: string | null;
  durationMs: number;
  errorCode?: string;
}) {
  logger.info(payload, "trpc request");
}

const routeLimitMiddleware = t.middleware(async (opts) => {
  const { checkRouteRateLimit } = await import("../lib/rate-limit");
  const path = (opts as { path?: string }).path as string | undefined;
  const { allowed } = await checkRouteRateLimit(path ?? "", {
    ip: opts.ctx.clientIp,
    userId: opts.ctx.userId ?? null,
  });
  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Try again later.",
    });
  }
  return opts.next({ ctx: opts.ctx });
});

const loggingMiddleware = t.middleware(async (opts) => {
  const start = Date.now();
  const path = (opts as { path?: string }).path as string | undefined;
  const result = await opts.next({ ctx: opts.ctx });
  const durationMs = Date.now() - start;
  const err = result.ok === false ? result.error : null;
  const errorCode = err ? (err as { code?: string }).code : undefined;
  const errorMessage = err ? (err as { message?: string }).message : undefined;
  logStructured({
    requestId: opts.ctx.requestId,
    path,
    userId: opts.ctx.userId ?? null,
    durationMs,
    errorCode,
  });
  if (err) {
    reportError({
      requestId: opts.ctx.requestId,
      path,
      userId: opts.ctx.userId ?? null,
      code: errorCode ?? "UNKNOWN",
      message: errorMessage ?? "Unknown error",
      ts: new Date().toISOString(),
    });
  }
  return result;
});

export const createTRPCRouter = t.router;
const withLogging = t.procedure.use(routeLimitMiddleware).use(loggingMiddleware);
export const publicProcedure = withLogging;
export const protectedProcedure = withLogging.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

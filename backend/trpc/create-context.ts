import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@supabase/supabase-js";
import { supabase as sharedSupabase } from "@/backend/lib/supabase";

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
  console.log('[Context] Creating context...');
  const authHeader = opts.req.headers.get('authorization');
  let userId: string | null = null;
  let supabase = sharedSupabase;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    console.log('[Context] Auth token present, verifying user...');
    try {
      const { data: { user }, error } = await sharedSupabase.auth.getUser(token);
      if (error) {
        console.error('[Context] Auth verification error:', error.message);
      } else if (user) {
        userId = user.id;
        supabase = createUserSupabase(token);
        console.log('[Context] Authenticated user:', userId);
      }
    } catch (err) {
      console.error('[Context] Auth crash:', err);
    }
  } else {
    console.log('[Context] No auth header present');
  }

  return {
    req: opts.req,
    userId,
    supabase,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

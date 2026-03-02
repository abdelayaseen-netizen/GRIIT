import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@supabase/supabase-js";
import { supabase as sharedSupabase } from "../lib/supabase";

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
  const authHeader = opts.req.headers.get('authorization');
  let userId: string | null = null;
  let supabase = sharedSupabase;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const { data: { user }, error } = await sharedSupabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
        supabase = createUserSupabase(token);
      }
    } catch {
      // Auth verification failed — proceed without user
    }
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

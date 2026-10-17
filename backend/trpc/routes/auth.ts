import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { getSupabaseAdmin, hasSupabaseAdmin } from "../../lib/supabase-admin";
import { persistGuestMerge, type GuestMergeAdmin } from "../../lib/guest-merge-persist";
import { readGuestMergeTicket, signGuestMergeTicket } from "../../lib/guest-merge-ticket";

const AUTH_ERROR_MESSAGE = "Invalid email or password.";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email().max(255),
      password: z.string().min(6, "Password must be at least 6 characters").max(512),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: { emailRedirectTo: undefined },
      });

      if (error) {
        const msg = error.message?.toLowerCase().includes("already registered") ? "An account with this email already exists." : AUTH_ERROR_MESSAGE;
        throw new TRPCError({ code: "BAD_REQUEST", message: msg });
      }
      return { user: data.user, session: data.session };
    }),

  signIn: publicProcedure
    .input(z.object({
      email: z.string().email().max(255),
      password: z.string().min(1, "Password is required").max(512),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email.trim().toLowerCase(),
        password: input.password,
      });

      if (error) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: AUTH_ERROR_MESSAGE });
      }
      return { user: data.user, session: data.session };
    }),

  signOut: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      const { error } = await ctx.supabase.auth.signOut();
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to sign out." });
      }
      return { success: true };
    }),

  getSession: publicProcedure
    .query(async ({ ctx }) => {
      const { data: { session } } = await ctx.supabase.auth.getSession();
      return { session };
    }),

  prepareGuestMerge: protectedProcedure.mutation(({ ctx }) => {
    if (!ctx.isAnonymous || !ctx.userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only a guest session can prepare a move." });
    }
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || !hasSupabaseAdmin()) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't move today's progress. You're still a guest." });
    }
    return { ticket: signGuestMergeTicket(ctx.userId, secret, Date.now()) };
  }),

  claimGuestMerge: protectedProcedure
    .input(z.object({ ticket: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.isAnonymous || !ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sign in before moving guest progress." });
      }
      const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!secret || !hasSupabaseAdmin()) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't move today's progress." });
      }
      const ticket = readGuestMergeTicket(input.ticket, secret, Date.now());
      if (!ticket || ticket.fromUserId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That guest session is no longer available." });
      }
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.auth.admin.getUserById(ticket.fromUserId);
      if (error || !data.user || data.user.is_anonymous !== true) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That guest session is no longer available." });
      }
      await persistGuestMerge(admin as unknown as GuestMergeAdmin, ticket.fromUserId, ctx.userId);
      return { ok: true as const };
    }),

  /** Resolve username to email for login. Uses service role to look up auth.users. Returns null if not found or admin unavailable. */
  getEmailForUsername: publicProcedure
    .input(z.object({ username: z.string().min(1).max(64).transform((s) => s.trim().toLowerCase()) }))
    .query(async ({ input }) => {
      if (!hasSupabaseAdmin()) return null;
      const admin = getSupabaseAdmin();
      const { data: profile } = await admin.from("profiles").select("user_id").eq("username", input.username).maybeSingle();
      if (!profile?.user_id) return null;
      const { data: { user }, error } = await admin.auth.admin.getUserById(profile.user_id);
      if (error || !user?.email) return null;
      return { email: user.email };
    }),
});

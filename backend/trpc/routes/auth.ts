import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";

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
});

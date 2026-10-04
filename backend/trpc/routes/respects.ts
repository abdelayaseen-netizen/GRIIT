/**
 * User-to-user respects used a table that is not in production.
 * Feed likes are feed.react → feed_reactions. These procedures stay
 * mounted so an old client gets a clear error instead of a missing-table failure.
 */
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const RETIRED = "Respects are on feed posts.";

export const respectsRouter = createTRPCRouter({
  give: protectedProcedure
    .input(z.object({ recipientId: z.string().uuid() }))
    .mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
    }),
  getForUser: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).optional(),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
    }),
  getCountForUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
    }),
});

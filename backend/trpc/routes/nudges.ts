/**
 * The old nudges table is not in production. Group nudges write
 * in_app_notifications. These procedures stay mounted so older builds
 * get a clear error instead of a missing-table failure.
 */
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const RETIRED = "Nudges live in group challenges now.";

export const NUDGE_MESSAGES = [
  "You showed up today. That's discipline.",
  "Don't break the chain.",
  "Small wins stack.",
] as const;

export function pickRandomMessage(): string {
  const i = Math.floor(Math.random() * NUDGE_MESSAGES.length);
  return NUDGE_MESSAGES[i] ?? NUDGE_MESSAGES[0];
}

export const nudgesRouter = createTRPCRouter({
  send: protectedProcedure
    .input(z.object({ toUserId: z.string().uuid() }))
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
});

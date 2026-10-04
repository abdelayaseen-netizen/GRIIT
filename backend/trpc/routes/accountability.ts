/**
 * Accountability partners are retired. The procedures stay mounted so older
 * builds get a clear error instead of a missing route. They do not read
 * a partners table and they do not send partner pushes.
 */
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const RETIRED = "Accountability partners are now groups.";

export const accountabilityRouter = createTRPCRouter({
  listMine: protectedProcedure.query(() => {
    throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
  }),
  invite: protectedProcedure
    .input(z.object({ partnerId: z.string().uuid() }))
    .mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
    }),
  respond: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid(), action: z.enum(["accept", "decline"]) }))
    .mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
    }),
  remove: protectedProcedure
    .input(z.object({ partnerId: z.string().uuid() }))
    .mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: RETIRED });
    }),
});

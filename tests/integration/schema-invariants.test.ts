/**
 * Live schema invariants for the secure_day fix stack (main @ 50f541f).
 * Read-only. Uses DATABASE_URL / SUPABASE_DB_URL for pg_catalog (PostgREST
 * cannot see it even with the service role).
 *
 * Tests 5 and 6: expected values MUST be filled from a live probe before
 * asserting — do not assume.
 */
import { describe, expect, it } from "vitest";
import { createServiceRoleClient } from "./helpers/service-role";
import { sql } from "./helpers/sql";

describe("schema invariants (secure_day stack)", () => {
  it("service role client can reach the live project", async () => {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("profiles").select("user_id").limit(1);
    expect(error, error?.message).toBeNull();
  });

  it("secure_day exists and prosecdef = true", async () => {
    const rows = await sql<{ proname: string; prosecdef: boolean }>(
      `
      SELECT p.proname, p.prosecdef
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'secure_day'
        AND pg_get_function_identity_arguments(p.oid) = 'uuid'
      `
    );
    expect(rows.length).toBe(1);
    expect(rows[0]?.prosecdef).toBe(true);
  });

  it("streaks has a single-column unique constraint on user_id", async () => {
    const rows = await sql<{ conname: string; cols: string }>(
      `
      SELECT c.conname,
             pg_get_constraintdef(c.oid) AS cols
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'streaks'
        AND c.contype = 'u'
        AND (
          SELECT array_agg(a.attname::text ORDER BY u.ord)
          FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, ord)
          JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = u.attnum
        ) = ARRAY['user_id']::text[]
      `
    );
    expect(rows.length, `expected a UNIQUE (user_id) constraint; got ${JSON.stringify(rows)}`).toBeGreaterThanOrEqual(1);
  });

  it("streaks composite unique on (user_id, challenge_id) still exists", async () => {
    // May be a constraint or a unique index (production historically used an index).
    const constraintRows = await sql<{ name: string; def: string }>(
      `
      SELECT c.conname AS name, pg_get_constraintdef(c.oid) AS def
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'streaks'
        AND c.contype = 'u'
        AND pg_get_constraintdef(c.oid) LIKE '%(user_id, challenge_id)%'
      `
    );
    const indexRows = await sql<{ name: string; def: string }>(
      `
      SELECT i.relname AS name, pg_get_indexdef(i.oid) AS def
      FROM pg_index x
      JOIN pg_class i ON i.oid = x.indexrelid
      JOIN pg_class t ON t.oid = x.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'streaks'
        AND x.indisunique
        AND pg_get_indexdef(i.oid) LIKE '%(user_id, challenge_id)%'
      `
    );
    const found = [...constraintRows, ...indexRows];
    expect(found.length, `expected composite unique (user_id, challenge_id); got ${JSON.stringify(found)}`).toBeGreaterThanOrEqual(1);
  });

  it("streaks relrowsecurity = true", async () => {
    const rows = await sql<{ relrowsecurity: boolean }>(
      `
      SELECT c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'streaks'
      `
    );
    expect(rows.length).toBe(1);
    expect(rows[0]?.relrowsecurity).toBe(true);
  });

  it("policy count on streaks", async () => {
    const rows = await sql<{ policy_count: string }>(
      `
      SELECT COUNT(*)::text AS policy_count
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'streaks'
      `
    );
    const policyCount = Number(rows[0]?.policy_count);
    // PLACEHOLDER — replaced after live probe (Phase 1 gate for test 5).
    throw new Error(
      `[probe] streaks policy_count = ${policyCount}. Paste this, then replace this throw with expect(policyCount).toBe(${policyCount}).`
    );
  });

  it("day_secures unique constraint definition", async () => {
    const rows = await sql<{ conname: string; def: string }>(
      `
      SELECT c.conname, pg_get_constraintdef(c.oid) AS def
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'day_secures'
        AND c.contype = 'u'
      ORDER BY c.conname
      `
    );
    // PLACEHOLDER — replaced after live probe (Phase 1 gate for test 6).
    throw new Error(
      `[probe] day_secures unique constraints = ${JSON.stringify(rows)}. Paste this, then assert the exact def.`
    );
  });
});

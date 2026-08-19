/**
 * Catalog / SQL helpers for integration tests.
 *
 * PostgREST (even with the service role) cannot query pg_catalog. Schema
 * invariant checks therefore need a direct Postgres connection via
 * DATABASE_URL or SUPABASE_DB_URL (Session or Transaction pooler URI).
 *
 * The service-role Supabase client is used elsewhere for auth.admin + table I/O.
 */

import pg from "pg";

function databaseUrl(): string {
  const url = (process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL)?.trim();
  if (!url) {
    throw new Error(
      "[integration] DATABASE_URL or SUPABASE_DB_URL is required for pg_catalog queries " +
        "(service role cannot reach pg_proc / pg_constraint via PostgREST)."
    );
  }
  return url;
}

export async function sql<T extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = new pg.Client({
    connectionString: databaseUrl(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const result = await client.query(query, params);
    return result.rows as T[];
  } finally {
    await client.end();
  }
}

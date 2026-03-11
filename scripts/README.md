# Scripts

## Seed Discover challenges

To populate the Discover tab (Starter Pack + Featured challenges), run the seed SQL in your Supabase project:

1. Open [Supabase Dashboard](https://app.supabase.com) → your project → **SQL Editor**.
2. Paste the contents of `scripts/seed-challenges.sql`.
3. Run the query.

This inserts featured challenges and starter-pack challenges (with `source_starter_id`) so `challenges.getFeatured` and `challenges.getStarterPack` return data. Safe to re-run (uses ON CONFLICT DO NOTHING / WHERE NOT EXISTS).

# Database migrations

Do not treat this file, `backend/seed.sql`, or older SQL notes as live schema. Production has drifted. Verify the database you are looking at before trusting any inventory.

## Verify before trusting

```sql
select table_name from information_schema.tables where table_schema='public' order by 1;

select column_name, data_type, column_default from information_schema.columns where table_schema='public' and table_name='<table>' order by ordinal_position;

select policyname, cmd, qual from pg_policies where tablename='<table>';
```

## Tracked files

Repo migrations live in `supabase/migrations/`. A filename list is in `docs/migration-inventory.txt`. Apply only what the live schema is missing.

After running SQL: reload PostgREST (`NOTIFY pgrst, 'reload schema';` or Dashboard → Settings → API → Reload schema).

If a migration fails with “already exists”, that step was already applied — skip it and continue.

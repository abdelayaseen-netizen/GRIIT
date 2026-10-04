-- Prod already has this column. Track it so migrations match.
-- DO NOT apply against production until asked — add column if not exists is a no-op there.

alter table check_ins add column if not exists verification_gates jsonb;

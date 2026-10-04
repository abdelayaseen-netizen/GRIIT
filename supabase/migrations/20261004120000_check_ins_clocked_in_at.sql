-- DRAFT. DO NOT APPLY until reviewed.
-- Prod already has check_ins.clocked_in_at (confirmed by Yaseen).
-- This records it. ADD COLUMN IF NOT EXISTS is a no-op when the column is already there.
-- Type timestamptz is [UNVERIFIED]. The app writes an ISO timestamp string.
-- verification_gates is already drafted in 20261004010000_check_ins_verification_gates.sql.

alter table public.check_ins
  add column if not exists clocked_in_at timestamptz;

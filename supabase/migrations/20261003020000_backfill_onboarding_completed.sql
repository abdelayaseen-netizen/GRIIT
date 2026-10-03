-- DRAFT ONLY. Do not apply from CI or the agent.
-- Yaseen applies by hand in the Supabase SQL editor.
--
-- Existing Apple / ensure-profile rows have a username but
-- onboarding_completed is still false, which used to bounce
-- returning users into onboarding. Backfill the flag to match
-- the new onboarded rule (flag true OR username present).

update profiles
set onboarding_completed = true
where username is not null
  and coalesce(onboarding_completed, false) = false;

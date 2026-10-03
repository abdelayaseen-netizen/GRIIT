-- DRAFT ONLY. Do not apply from CI or the agent.
-- Yaseen applies by hand in the Supabase SQL editor.
--
-- Chosen handles on permanent accounts should be onboarded.
-- Skip anonymous users and ensure-profile auto handles
-- (`user_` + first 8 hex of auth.users.id — backend/lib/guest-username.ts).

-- Preview (run this first):
-- select p.user_id, p.username, p.onboarding_completed, u.is_anonymous
-- from profiles p
-- join auth.users u on u.id = p.user_id
-- where coalesce(u.is_anonymous, false) = false
--   and p.username is not null
--   and p.username !~ '^user_[0-9a-f]{8}$'
--   and coalesce(p.onboarding_completed, false) = false;

update profiles p
set onboarding_completed = true
from auth.users u
where u.id = p.user_id
  and coalesce(u.is_anonymous, false) = false
  and p.username is not null
  and p.username !~ '^user_[0-9a-f]{8}$'
  and coalesce(p.onboarding_completed, false) = false;

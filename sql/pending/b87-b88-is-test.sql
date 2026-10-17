-- Read only. Do not run from the app or from CI.
-- Lists Maestro b87* and b88* accounts and whether profiles.is_test is set.
-- Build 88 hides a feed author only when is_test is true (or the display name is "app review").

SELECT
  u.email,
  p.user_id,
  p.username,
  p.display_name,
  p.is_test
FROM auth.users AS u
LEFT JOIN public.profiles AS p
  ON p.user_id = u.id
WHERE u.email ILIKE 'b87%@example.com'
   OR u.email ILIKE 'b88%@example.com'
ORDER BY u.email;

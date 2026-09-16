-- Allow in-app notification type used by groups.invite.
-- Does not create or alter teams / team_members / team_invites / challenge_type.

ALTER TABLE public.in_app_notifications DROP CONSTRAINT IF EXISTS in_app_notifications_type_check;
ALTER TABLE public.in_app_notifications ADD CONSTRAINT in_app_notifications_type_check
  CHECK (type IN ('respect', 'comment', 'follow', 'rank', 'follow_request', 'general', 'challenge_invite'));

NOTIFY pgrst, 'reload schema';

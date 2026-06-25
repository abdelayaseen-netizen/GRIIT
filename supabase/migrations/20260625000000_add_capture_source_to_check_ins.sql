-- S1: Add capture_source to check_ins to record camera vs library proof origin.
-- Server-side enforcement: verifyTask mutation rejects require_camera_only tasks
-- where capture_source != 'camera'. Client-reported but server-enforced.
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS capture_source TEXT
  CONSTRAINT check_ins_capture_source_check
    CHECK (capture_source IN ('camera', 'library', 'strava', 'unknown'));

COMMENT ON COLUMN public.check_ins.capture_source IS
  'How the proof was captured: camera = live camera, library = photo library, strava = provider, unknown = not reported.';

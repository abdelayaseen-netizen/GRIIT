-- Camera-proof columns for checkins.complete in-app capture.
-- hasCameraProof reads verified || proof_photo_url.

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS proof_photo_url TEXT;

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS verified BOOLEAN;

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS verification_method TEXT;

COMMENT ON COLUMN public.check_ins.proof_photo_url IS
  'In-app camera capture URL. Never set from a library pick.';
COMMENT ON COLUMN public.check_ins.verified IS
  'True when the completion is camera proof (in-app capture).';
COMMENT ON COLUMN public.check_ins.verification_method IS
  'photo when in-app capture; otherwise unset on complete.';

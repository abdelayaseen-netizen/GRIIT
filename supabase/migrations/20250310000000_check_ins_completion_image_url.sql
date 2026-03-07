-- Add completion_image_url to check_ins for feed/display (stores same value as proof_url for task completions with photo).
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS completion_image_url TEXT;

COMMENT ON COLUMN check_ins.completion_image_url IS 'Public URL of completion photo; set when proof_url is provided.';

NOTIFY pgrst, 'reload schema';

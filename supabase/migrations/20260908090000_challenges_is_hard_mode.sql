alter table public.challenges
  add column if not exists is_hard_mode boolean not null default false;

comment on column public.challenges.is_hard_mode is
  'Challenge-level hard mode. Set at create from wizard difficultyMode; per-task gates live in challenge_tasks.config.hard_mode.';

import { z } from "zod";

export const todayTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  done: z.boolean(),
  require_photo: z.boolean(),
  require_location: z.boolean(),
  config: z.record(z.string(), z.unknown()).nullable(),
});

export const todayEnrollmentSchema = z.object({
  active_challenge_id: z.string().uuid(),
  challenge_id: z.string().uuid(),
  title: z.string(),
  current_day: z.number(),
  secured_today: z.boolean(),
  tasks: z.array(todayTaskSchema),
});

export const todayStateSchema = z.object({
  date_key: z.string(),
  secured: z.boolean(),
  streak: z.number(),
  secured_date_keys: z.array(z.string()),
  enrollments: z.array(todayEnrollmentSchema),
  remaining_challenges: z.number(),
});

export type TodayTask = z.infer<typeof todayTaskSchema>;
export type TodayEnrollment = z.infer<typeof todayEnrollmentSchema>;
export type TodayState = z.infer<typeof todayStateSchema>;

export const EMPTY_TODAY: TodayState = {
  date_key: "",
  secured: false,
  streak: 0,
  secured_date_keys: [],
  enrollments: [],
  remaining_challenges: 0,
};

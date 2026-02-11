import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";

export const challengesRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('challenges')
        .select(`
          *,
          challenge_tasks (*)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (input.search) {
        query = query.ilike('title', `%${input.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      return data.map((challenge: any) => ({
        ...challenge,
        tasks: challenge.challenge_tasks || [],
      }));
    }),

  getFeatured: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      console.log('[challenges.getFeatured] Fetching featured challenges...');
      let query = ctx.supabase
        .from('challenges')
        .select(`
          *,
          challenge_tasks (*)
        `)
        .eq('visibility', 'public')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('participants_count', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (input?.search) {
        query = query.ilike('title', `%${input.search}%`);
      }

      if (input?.category && input.category !== 'all') {
        query = query.eq('category', input.category);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[challenges.getFeatured] Error:', error.message);
        throw new Error(error.message);
      }

      console.log('[challenges.getFeatured] Found', data?.length, 'challenges');
      return (data || []).map((challenge: any) => ({
        ...challenge,
        tasks: challenge.challenge_tasks || [],
      }));
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('challenges')
        .select(`
          *,
          challenge_tasks (*)
        `)
        .eq('id', input.id)
        .single();

      if (error) throw new Error(error.message);
      
      return {
        ...data,
        tasks: data.challenge_tasks || [],
      };
    }),

  join: protectedProcedure
    .input(z.object({ 
      challengeId: z.string() 
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: challenge, error: challengeError } = await ctx.supabase
        .from('challenges')
        .select('*, challenge_tasks (*)')
        .eq('id', input.challengeId)
        .single();

      if (challengeError) throw new Error(challengeError.message);

      const startAt = new Date().toISOString();
      const endAt = new Date();
      
      if (challenge.duration_type === '24h') {
        endAt.setHours(endAt.getHours() + 24);
      } else {
        endAt.setDate(endAt.getDate() + challenge.duration_days);
      }

      const { data: activeChallenge, error: acError } = await ctx.supabase
        .from('active_challenges')
        .insert({
          user_id: ctx.userId,
          challenge_id: input.challengeId,
          status: 'active',
          start_at: startAt,
          end_at: endAt.toISOString(),
          current_day: 1,
          progress_percent: 0,
        })
        .select()
        .single();

      if (acError) throw new Error(acError.message);

      const dateKey = new Date().toISOString().split('T')[0];
      const checkIns = challenge.challenge_tasks.map((task: any) => ({
        user_id: ctx.userId,
        active_challenge_id: activeChallenge.id,
        task_id: task.id,
        date_key: dateKey,
        status: 'pending',
      }));

      await ctx.supabase.from('check_ins').insert(checkIns);

      const { error: streakError } = await ctx.supabase
        .from('streaks')
        .upsert({
          user_id: ctx.userId,
          active_streak_count: 0,
          longest_streak_count: 0,
        });

      if (streakError) throw new Error(streakError.message);

      return activeChallenge;
    }),

  getActive: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('active_challenges')
        .select(`
          *,
          challenges (
            *,
            challenge_tasks (*)
          )
        `)
        .eq('user_id', ctx.userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      type: z.enum(['standard', 'one_day']),
      durationDays: z.number().min(1, "Duration must be at least 1 day"),
      visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional().default('FRIENDS'),
      categories: z.array(z.string()).optional(),
      liveDate: z.string().optional(),
      replayPolicy: z.enum(['live_only', 'allow_replay']).optional(),
      requireSameRules: z.boolean().optional(),
      showReplayLabel: z.boolean().optional(),
      tasks: z.array(z.object({
        title: z.string().min(1, "Task title is required"),
        type: z.string(),
        required: z.boolean(),
        minWords: z.number().optional(),
        targetValue: z.number().optional(),
        unit: z.string().optional(),
        trackingMode: z.string().optional(),
        photoRequired: z.boolean().optional(),
        locationName: z.string().optional(),
        radiusMeters: z.number().optional(),
        durationMinutes: z.number().optional(),
        mustCompleteInSession: z.boolean().optional(),
        locations: z.array(z.any()).optional(),
        startTime: z.string().optional(),
        startWindowMinutes: z.number().optional(),
        minSessionMinutes: z.number().optional(),
        journalType: z.array(z.string()).optional(),
        journalPrompt: z.string().optional(),
        allowFreeWrite: z.boolean().optional(),
        captureMood: z.boolean().optional(),
        captureEnergy: z.boolean().optional(),
        captureBodyState: z.boolean().optional(),
        wordLimitEnabled: z.boolean().optional(),
        wordLimitMode: z.enum(["PRESET", "CUSTOM"]).optional(),
        wordLimitWords: z.number().min(20).max(1000).nullable().optional(),
        timeEnforcementEnabled: z.boolean().optional(),
        scheduleType: z.enum(["NONE", "DAILY", "CUSTOM_DATES"]).optional(),
        anchorTimeLocal: z.string().nullable().optional(),
        taskDurationMinutes: z.number().nullable().optional(),
        windowStartOffsetMin: z.number().nullable().optional(),
        windowEndOffsetMin: z.number().nullable().optional(),
        hardWindowEnabled: z.boolean().optional(),
        hardWindowStartOffsetMin: z.number().nullable().optional(),
        hardWindowEndOffsetMin: z.number().nullable().optional(),
        timezoneMode: z.enum(["USER_LOCAL", "CHALLENGE_TIMEZONE"]).optional(),
        challengeTimezone: z.string().nullable().optional(),
      })).min(1, "At least one task is required"),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('[challenges.create] Starting mutation:', {
        title: input.title,
        type: input.type,
        durationDays: input.durationDays,
        tasksCount: input.tasks.length,
        userId: ctx.userId,
        hasSupabase: !!ctx.supabase,
      });

      if (input.tasks.length === 0) {
        throw new Error('At least one task is required');
      }

      for (let i = 0; i < input.tasks.length; i++) {
        const task = input.tasks[i];
        if (!task.title.trim()) {
          throw new Error(`Task ${i + 1}: Title is required`);
        }

        switch (task.type) {
          case 'journal':
            if (!task.minWords || task.minWords <= 0) {
              throw new Error(`Task "${task.title}": Minimum words is required`);
            }
            break;
          case 'timer':
            if (!task.durationMinutes || task.durationMinutes <= 0) {
              throw new Error(`Task "${task.title}": Duration is required`);
            }
            break;
          case 'run':
            if (task.trackingMode === 'distance') {
              if (!task.targetValue || task.targetValue <= 0) {
                throw new Error(`Task "${task.title}": Distance is required`);
              }
            } else if (task.trackingMode === 'time') {
              if (!task.targetValue || task.targetValue <= 0) {
                throw new Error(`Task "${task.title}": Time duration is required`);
              }
            }
            break;
          case 'checkin':
            if (!task.locationName || !task.locationName.trim()) {
              throw new Error(`Task "${task.title}": Location name is required`);
            }
            if (!task.radiusMeters || task.radiusMeters <= 0) {
              throw new Error(`Task "${task.title}": Radius is required`);
            }
            break;
        }
      }
      const { data: challenge, error: challengeError } = await ctx.supabase
        .from('challenges')
        .insert({
          creator_id: ctx.userId,
          title: input.title,
          description: input.description,
          duration_type: input.type === 'one_day' ? '24h' : 'multi_day',
          duration_days: input.durationDays,
          category: input.categories?.[0] || 'other',
          difficulty: 'medium',
          live_date: input.liveDate || null,
          replay_policy: input.replayPolicy || 'allow_replay',
          require_same_rules: input.requireSameRules ?? true,
          show_replay_label: input.showReplayLabel ?? true,
          visibility: (input.visibility || 'FRIENDS').toLowerCase(),
        })
        .select()
        .single();

      if (challengeError) {
        console.error('[challenges.create] Challenge insert error:', JSON.stringify(challengeError));
        throw new Error(`Failed to create challenge: ${challengeError.message} (code: ${challengeError.code}, details: ${challengeError.details})`);
      }

      console.log('[challenges.create] Challenge row inserted:', challenge.id);

      const tasksToInsert = input.tasks.map((task) => ({
        challenge_id: challenge.id,
        title: task.title,
        type: task.type,
        required: task.required,
        min_words: task.minWords,
        target_value: task.targetValue,
        unit: task.unit,
        tracking_mode: task.trackingMode,
        photo_required: task.photoRequired,
        location_name: task.locationName,
        radius_meters: task.radiusMeters,
        duration_minutes: task.durationMinutes,
        must_complete_in_session: task.mustCompleteInSession,
        locations: task.locations,
        start_time: task.startTime,
        start_window_minutes: task.startWindowMinutes,
        min_session_minutes: task.minSessionMinutes,
        journal_type: task.journalType,
        journal_prompt: task.journalPrompt,
        allow_free_write: task.allowFreeWrite,
        capture_mood: task.captureMood,
        capture_energy: task.captureEnergy,
        capture_body_state: task.captureBodyState,
        word_limit_enabled: task.wordLimitEnabled,
        word_limit_mode: task.wordLimitMode,
        word_limit_words: task.wordLimitEnabled ? task.wordLimitWords : null,
        time_enforcement_enabled: task.timeEnforcementEnabled,
        schedule_type: task.timeEnforcementEnabled ? (task.scheduleType || 'DAILY') : null,
        anchor_time_local: task.timeEnforcementEnabled ? task.anchorTimeLocal : null,
        task_duration_minutes: task.timeEnforcementEnabled ? task.taskDurationMinutes : null,
        window_start_offset_min: task.timeEnforcementEnabled ? task.windowStartOffsetMin : null,
        window_end_offset_min: task.timeEnforcementEnabled ? task.windowEndOffsetMin : null,
        hard_window_enabled: task.timeEnforcementEnabled ? task.hardWindowEnabled : null,
        hard_window_start_offset_min: task.timeEnforcementEnabled && task.hardWindowEnabled ? task.hardWindowStartOffsetMin : null,
        hard_window_end_offset_min: task.timeEnforcementEnabled && task.hardWindowEnabled ? task.hardWindowEndOffsetMin : null,
        timezone_mode: task.timeEnforcementEnabled ? (task.timezoneMode || 'USER_LOCAL') : null,
        challenge_timezone: task.timeEnforcementEnabled && task.timezoneMode === 'CHALLENGE_TIMEZONE' ? task.challengeTimezone : null,
      }));

      const { data: tasks, error: tasksError } = await ctx.supabase
        .from('challenge_tasks')
        .insert(tasksToInsert)
        .select();

      if (tasksError) {
        console.error('[challenges.create] Tasks insert error:', JSON.stringify(tasksError));
        throw new Error(`Failed to create tasks: ${tasksError.message} (code: ${tasksError.code}, details: ${tasksError.details})`);
      }

      console.log('[challenges.create] Success:', {
        challengeId: challenge.id,
        tasksCount: tasks?.length || 0
      });

      return {
        ...challenge,
        tasks: tasks || [],
      };
    }),
});

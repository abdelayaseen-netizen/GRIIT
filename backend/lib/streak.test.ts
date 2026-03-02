import { describe, it, expect } from 'vitest';
import { computeNewStreakCount } from './streak';

describe('computeNewStreakCount', () => {
  it('returns 1 and 1 when no previous streak', () => {
    const r = computeNewStreakCount('2025-03-01', null);
    expect(r.newStreakCount).toBe(1);
    expect(r.longestStreak).toBe(1);
  });

  it('returns 1 when last completed was not yesterday (gap in streak)', () => {
    const r = computeNewStreakCount('2025-03-01', {
      last_completed_date_key: '2025-02-27',
      active_streak_count: 5,
      longest_streak_count: 10,
    });
    expect(r.newStreakCount).toBe(1);
    expect(r.longestStreak).toBe(10);
  });

  it('increments streak when last completed was yesterday', () => {
    const r = computeNewStreakCount('2025-03-01', {
      last_completed_date_key: '2025-02-28',
      active_streak_count: 3,
      longest_streak_count: 7,
    });
    expect(r.newStreakCount).toBe(4);
    expect(r.longestStreak).toBe(7);
  });

  it('updates longest when new streak exceeds it', () => {
    const r = computeNewStreakCount('2025-03-01', {
      last_completed_date_key: '2025-02-28',
      active_streak_count: 4,
      longest_streak_count: 4,
    });
    expect(r.newStreakCount).toBe(5);
    expect(r.longestStreak).toBe(5);
  });

  it('handles first-ever completion (null counts)', () => {
    const r = computeNewStreakCount('2025-03-01', {
      last_completed_date_key: '2025-02-28',
      active_streak_count: null,
      longest_streak_count: null,
    });
    expect(r.newStreakCount).toBe(1);
    expect(r.longestStreak).toBe(1);
  });
});

import { describe, it, expect } from 'vitest';
import {
  formatTimeHHMM,
  computeWindowSummary,
  validateTimeEnforcement,
} from './time-enforcement';

describe('formatTimeHHMM', () => {
  it('formats 24h to 12h with AM/PM', () => {
    expect(formatTimeHHMM('09:30')).toBe('9:30 AM');
    expect(formatTimeHHMM('14:00')).toBe('2:00 PM');
    expect(formatTimeHHMM('00:00')).toBe('12:00 AM');
    expect(formatTimeHHMM('12:00')).toBe('12:00 PM');
  });

  it('pads minutes', () => {
    expect(formatTimeHHMM('08:05')).toBe('8:05 AM');
  });
});

describe('computeWindowSummary', () => {
  it('returns time range string', () => {
    const out = computeWindowSummary('09:00', 0, 60);
    expect(out).toContain('9:00');
    expect(out).toContain('10:00');
    expect(out).toMatch(/\d+:\d{2}\s*(AM|PM)\s*–\s*\d+:\d{2}\s*(AM|PM)/);
  });
});

describe('validateTimeEnforcement', () => {
  it('returns valid when timeEnforcementEnabled is false', () => {
    expect(validateTimeEnforcement({ timeEnforcementEnabled: false })).toEqual({
      valid: true,
    });
  });

  it('requires anchor time when enabled', () => {
    expect(
      validateTimeEnforcement({ timeEnforcementEnabled: true })
    ).toEqual({ valid: false, error: 'Target time is required' });
  });

  it('validates HH:mm format', () => {
    expect(
      validateTimeEnforcement({
        timeEnforcementEnabled: true,
        anchorTimeLocal: 'invalid',
      })
    ).toEqual({ valid: false, error: 'Time must be in HH:mm format' });
  });

  it('validates window offsets when provided', () => {
    expect(
      validateTimeEnforcement({
        timeEnforcementEnabled: true,
        anchorTimeLocal: '09:00',
        windowStartOffsetMin: 0,
        windowEndOffsetMin: 60,
      })
    ).toEqual({ valid: true });
  });

  it('rejects window end before start', () => {
    expect(
      validateTimeEnforcement({
        timeEnforcementEnabled: true,
        anchorTimeLocal: '09:00',
        windowStartOffsetMin: 60,
        windowEndOffsetMin: 0,
      })
    ).toEqual({ valid: false, error: 'Window end must be after window start' });
  });
});

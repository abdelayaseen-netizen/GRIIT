import { describe, it, expect, vi } from 'vitest';

/* eslint-disable import/first -- vi.mock must precede the imports it intercepts */
// Avoid loading React Native / Sentry native stack when importing api.ts
vi.mock('@/lib/sentry', () => ({ captureError: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: {} }));
vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));

import { formatError, formatTRPCError } from './api';
/* eslint-enable import/first */

describe('formatError', () => {
  it('returns "Unknown error" for null and undefined', () => {
    expect(formatError(null)).toBe('Unknown error');
    expect(formatError(undefined)).toBe('Unknown error');
  });

  it('returns string as-is', () => {
    expect(formatError('something broke')).toBe('something broke');
  });

  it('returns Error message', () => {
    expect(formatError(new Error('fail'))).toBe('fail');
  });

  it('returns object.message when present', () => {
    expect(formatError({ message: 'custom' })).toBe('custom');
  });

  it('handles REQUEST_TIMEOUT for retry detection', () => {
    const out = formatError(new Error('REQUEST_TIMEOUT'));
    expect(out).toContain('REQUEST_TIMEOUT');
  });
});

describe('formatTRPCError', () => {
  it('sets isNetwork true for fetch/network errors', () => {
    const r = formatTRPCError(new Error('Failed to fetch'));
    expect(r.isNetwork).toBe(true);
    expect(r.title).toBeDefined();
    expect(r.message).toBeDefined();
  });

  it('uses raw message for non-listed errors', () => {
    const r = formatTRPCError(new Error('Username already taken'));
    expect(r.isNetwork).toBe(false);
    expect(r.message).toContain('Username');
  });

  it('sets isNetwork true for "Cannot reach server" (retry path)', () => {
    const r = formatTRPCError(new Error('Cannot reach server. Backend may be starting.'));
    expect(r.isNetwork).toBe(true);
  });
});

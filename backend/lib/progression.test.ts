import { describe, it, expect } from 'vitest';
import {
  TIER_THRESHOLDS,
  getTierForDays,
  getPointsToNextTier,
  getNextTierName,
} from './progression';

describe('progression', () => {
  describe('TIER_THRESHOLDS', () => {
    it('has four tiers in order', () => {
      expect(TIER_THRESHOLDS).toHaveLength(4);
      expect(TIER_THRESHOLDS.map((t) => t.tier)).toEqual([
        'Starter',
        'Builder',
        'Relentless',
        'Elite',
      ]);
    });
  });

  describe('getTierForDays', () => {
    it('returns Starter for 0–6 days', () => {
      expect(getTierForDays(0)).toBe('Starter');
      expect(getTierForDays(3)).toBe('Starter');
      expect(getTierForDays(6)).toBe('Starter');
    });
    it('returns Builder for 7–29 days', () => {
      expect(getTierForDays(7)).toBe('Builder');
      expect(getTierForDays(15)).toBe('Builder');
      expect(getTierForDays(29)).toBe('Builder');
    });
    it('returns Relentless for 30–89 days', () => {
      expect(getTierForDays(30)).toBe('Relentless');
      expect(getTierForDays(60)).toBe('Relentless');
      expect(getTierForDays(89)).toBe('Relentless');
    });
    it('returns Elite for 90+ days', () => {
      expect(getTierForDays(90)).toBe('Elite');
      expect(getTierForDays(365)).toBe('Elite');
    });
  });

  describe('getPointsToNextTier', () => {
    it('returns days until next tier', () => {
      expect(getPointsToNextTier(0)).toBe(7);
      expect(getPointsToNextTier(6)).toBe(1);
      expect(getPointsToNextTier(7)).toBe(23);
      expect(getPointsToNextTier(29)).toBe(1);
      expect(getPointsToNextTier(30)).toBe(60);
      expect(getPointsToNextTier(89)).toBe(1);
    });
    it('returns 0 when already Elite', () => {
      expect(getPointsToNextTier(90)).toBe(0);
      expect(getPointsToNextTier(100)).toBe(0);
    });
  });

  describe('getNextTierName', () => {
    it('returns next tier name', () => {
      expect(getNextTierName(0)).toBe('Builder');
      expect(getNextTierName(6)).toBe('Builder');
      expect(getNextTierName(7)).toBe('Relentless');
      expect(getNextTierName(29)).toBe('Relentless');
      expect(getNextTierName(30)).toBe('Elite');
      expect(getNextTierName(89)).toBe('Elite');
    });
    it('returns null when Elite', () => {
      expect(getNextTierName(90)).toBe(null);
      expect(getNextTierName(100)).toBe(null);
    });
  });
});

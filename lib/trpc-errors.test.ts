import { describe, it, expect } from 'vitest';
import {
  TRPC_ERROR_CODE,
  TRPC_ERROR_TITLES,
  TRPC_ERROR_USER_MESSAGE,
} from './trpc-errors';

describe('trpc-errors', () => {
  describe('TRPC_ERROR_CODE', () => {
    it('defines expected codes', () => {
      expect(TRPC_ERROR_CODE.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(TRPC_ERROR_CODE.FORBIDDEN).toBe('FORBIDDEN');
      expect(TRPC_ERROR_CODE.BAD_REQUEST).toBe('BAD_REQUEST');
      expect(TRPC_ERROR_CODE.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
      expect(TRPC_ERROR_CODE.NOT_FOUND).toBe('NOT_FOUND');
    });
  });

  describe('TRPC_ERROR_TITLES', () => {
    it('has a title for every code', () => {
      expect(TRPC_ERROR_TITLES[TRPC_ERROR_CODE.UNAUTHORIZED]).toBe('Not Authorized');
      expect(TRPC_ERROR_TITLES[TRPC_ERROR_CODE.BAD_REQUEST]).toBe('Invalid Input');
      expect(TRPC_ERROR_TITLES[TRPC_ERROR_CODE.INTERNAL_SERVER_ERROR]).toBe('Server Error');
      expect(TRPC_ERROR_TITLES[TRPC_ERROR_CODE.NOT_FOUND]).toBe('Not Found');
    });
  });

  describe('TRPC_ERROR_USER_MESSAGE', () => {
    it('has user message for auth-related codes', () => {
      expect(TRPC_ERROR_USER_MESSAGE[TRPC_ERROR_CODE.UNAUTHORIZED]).toBe('Please sign in again.');
      expect(TRPC_ERROR_USER_MESSAGE[TRPC_ERROR_CODE.FORBIDDEN]).toBe('Please sign in again.');
    });
  });
});

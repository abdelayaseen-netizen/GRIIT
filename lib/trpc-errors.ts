/**
 * tRPC error codes. Keep in sync with backend TRPCError usage
 * (backend/trpc/create-context.ts and backend/trpc/routes/*.ts).
 * Used for consistent error titles/messages in the app.
 */
export const TRPC_ERROR_CODE = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type TrpcErrorCode = (typeof TRPC_ERROR_CODE)[keyof typeof TRPC_ERROR_CODE];

export const TRPC_ERROR_TITLES: Record<TrpcErrorCode, string> = {
  [TRPC_ERROR_CODE.UNAUTHORIZED]: 'Not Authorized',
  [TRPC_ERROR_CODE.FORBIDDEN]: 'Not Authorized',
  [TRPC_ERROR_CODE.BAD_REQUEST]: 'Invalid Input',
  [TRPC_ERROR_CODE.INTERNAL_SERVER_ERROR]: 'Server Error',
  [TRPC_ERROR_CODE.NOT_FOUND]: 'Not Found',
};

export const TRPC_ERROR_USER_MESSAGE: Partial<Record<TrpcErrorCode, string>> = {
  [TRPC_ERROR_CODE.UNAUTHORIZED]: 'Please sign in again.',
  [TRPC_ERROR_CODE.FORBIDDEN]: 'Please sign in again.',
};

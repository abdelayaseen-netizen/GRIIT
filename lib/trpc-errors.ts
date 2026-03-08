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
  TIMEOUT: 'TIMEOUT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

export type TrpcErrorCode = (typeof TRPC_ERROR_CODE)[keyof typeof TRPC_ERROR_CODE];

export const TRPC_ERROR_TITLES: Record<TrpcErrorCode, string> = {
  [TRPC_ERROR_CODE.UNAUTHORIZED]: 'Not Authorized',
  [TRPC_ERROR_CODE.FORBIDDEN]: 'Not Authorized',
  [TRPC_ERROR_CODE.BAD_REQUEST]: 'Invalid Input',
  [TRPC_ERROR_CODE.INTERNAL_SERVER_ERROR]: 'Server Error',
  [TRPC_ERROR_CODE.NOT_FOUND]: 'Not Found',
  [TRPC_ERROR_CODE.TIMEOUT]: 'Request Timed Out',
  [TRPC_ERROR_CODE.TOO_MANY_REQUESTS]: 'Too Many Requests',
};

export const TRPC_ERROR_USER_MESSAGE: Partial<Record<TrpcErrorCode, string>> = {
  [TRPC_ERROR_CODE.UNAUTHORIZED]: 'Please sign in again.',
  [TRPC_ERROR_CODE.FORBIDDEN]: 'Please sign in again.',
  [TRPC_ERROR_CODE.BAD_REQUEST]: "Something didn't look right. Please check your input and try again.",
  [TRPC_ERROR_CODE.NOT_FOUND]: "We couldn't find what you're looking for. It may have been removed.",
  [TRPC_ERROR_CODE.INTERNAL_SERVER_ERROR]: "Something went wrong on our end. Please try again in a moment.",
  [TRPC_ERROR_CODE.TIMEOUT]: "The request took too long. Please check your connection and try again.",
  [TRPC_ERROR_CODE.TOO_MANY_REQUESTS]: "You're doing that too fast. Please wait a moment and try again.",
};

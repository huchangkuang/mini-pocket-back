import type { ApiResponse } from '@mini-pocket/shared';

export type { ApiResponse };

export const success = <T>(data: T, message = 'ok'): ApiResponse<T> => ({
  code: 0,
  message,
  data,
});

export const fail = (code: number, message: string): ApiResponse<null> => ({
  code,
  message,
  data: null,
});

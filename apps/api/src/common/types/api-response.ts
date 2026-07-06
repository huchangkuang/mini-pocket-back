export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

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

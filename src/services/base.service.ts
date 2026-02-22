/** Generic service response wrapper for future backend integration */
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

/** Simulate async backend call with delay */
export function simulateDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function createServiceResponse<T>(
  data: T,
  errorMessage?: string,
): ServiceResponse<T> {
  return { data, success: !errorMessage, message: errorMessage };
}

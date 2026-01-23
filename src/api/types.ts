// Base API response structure
export type BaseApiResponse = {
  message: string;
  succeeded: boolean;
  statusCode: number;
}

// Generic paginated response
export interface PaginatedResponse<T> extends BaseApiResponse {
  data: {
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    succeeded: boolean;
    data: T[];
    errorMessage?: string;
    loadMore: boolean;
  };
}

// Generic report type (placeholder - actual structure depends on backend)
export interface Report {
  id?: number | string;
  [key: string]: unknown;
}

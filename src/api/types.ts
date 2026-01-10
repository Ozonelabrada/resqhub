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
    errorMessage: string;
    loadMore: boolean;
    baseEntity: any;
  };
  errors: any;
  baseEntity: any;
}

import { BaseApiResponse } from '../api/types';

export interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
  sortOrder?: number;
  itemsCount?: number;
  dateCreated?: string;
  lastModifiedDate?: string;
  createdBy?: string;
  lastModifiedBy?: string | null;
}

export interface CategoryResponse extends BaseApiResponse {
  data: {
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    succeeded: boolean;
    data: Category[];
    errorMessage?: string;
    loadMore: boolean;
  };
}
